'use server';

import { and, desc, eq, inArray, like, type SQL } from 'drizzle-orm';

import { getCurrentUserTeamIds, requireUser } from '~/lib/auth-server';
import { getDb, type Db } from '~/lib/db';
import {
  issueAssignees,
  issueLabels,
  issues,
  labels,
  priorities,
  projects,
  statuses,
  teamProjects,
  teams,
  user as userTable,
} from '~/lib/db/schema';
import type { User, UserStatus } from '~/types/users';
import LexRank from '~/utils/lexRank';

// ---------------------------------------------------------------------------
// Serializable DTOs returned to client components.
//
// Server Actions can only return serializable values, so icons are kept as
// strings (the UI converts them with `getIconFromString`). These objects are
// structurally compatible with the `Issue` type once cast on the client.
// ---------------------------------------------------------------------------

export interface IssueStatusDTO {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface IssuePriorityDTO {
  id: string;
  name: string;
  icon: string;
}

export interface IssueProjectDTO {
  id: string;
  name: string;
  icon: string;
  percentComplete: number | null;
}

export interface IssueDTO {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: IssueStatusDTO;
  priority: IssuePriorityDTO;
  assignees: User | null;
  labels: Array<{ id: string; name: string; color: string }>;
  createdAt: string;
  cycleId: string;
  rank: string;
  project?: IssueProjectDTO;
}

const DEFAULT_STATUS: IssueStatusDTO = {
  id: 'not-started',
  name: '未着手',
  color: '#CBD5E1',
  icon: 'circle',
};

const DEFAULT_PRIORITY: IssuePriorityDTO = {
  id: 'no-priority',
  name: '優先度なし',
  icon: 'circle',
};

// ---------------------------------------------------------------------------
// Authorization helpers (D1 has no RLS, so scope everything by team membership)
// ---------------------------------------------------------------------------

/**
 * Slugs of the teams the current user belongs to. Issue identifiers are
 * prefixed with the team slug (e.g. `CORE-12`), so these slugs are used both to
 * scope which issues a user can see/mutate and to mint new identifiers.
 */
async function getCurrentUserTeamSlugs(): Promise<string[]> {
  const teamIds = await getCurrentUserTeamIds();
  if (teamIds.length === 0) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({ slug: teams.slug })
    .from(teams)
    .where(inArray(teams.id, teamIds));

  return rows.map((row) => row.slug);
}

function teamSlugFromIdentifier(identifier: string): string {
  const dash = identifier.indexOf('-');
  return dash === -1 ? identifier : identifier.slice(0, dash);
}

/**
 * Ensure the current user may read/mutate the given issue (its identifier
 * prefix must belong to one of the user's teams). Returns the issue's
 * identifier on success and throws otherwise.
 */
async function assertIssueAccess(db: Db, issueId: string): Promise<string> {
  const [row] = await db
    .select({ identifier: issues.identifier })
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1);

  if (!row) {
    throw new Error('課題が見つかりません');
  }

  const slugs = await getCurrentUserTeamSlugs();
  if (!slugs.includes(teamSlugFromIdentifier(row.identifier))) {
    throw new Error('この課題を操作する権限がありません');
  }

  return row.identifier;
}

// ---------------------------------------------------------------------------
// Slug → primary-key resolution for reference data
// ---------------------------------------------------------------------------

async function statusIdFromSlug(
  db: Db,
  slug: string | null | undefined
): Promise<string | null> {
  if (!slug) return null;
  const [row] = await db
    .select({ id: statuses.id })
    .from(statuses)
    .where(eq(statuses.slug, slug))
    .limit(1);
  return row?.id ?? null;
}

async function priorityIdFromSlug(
  db: Db,
  slug: string | null | undefined
): Promise<string | null> {
  if (!slug) return null;
  const [row] = await db
    .select({ id: priorities.id })
    .from(priorities)
    .where(eq(priorities.slug, slug))
    .limit(1);
  return row?.id ?? null;
}

// ---------------------------------------------------------------------------
// Identifier / rank generation
// ---------------------------------------------------------------------------

async function nextIdentifier(db: Db, teamSlug: string): Promise<string> {
  const rows = await db
    .select({ identifier: issues.identifier })
    .from(issues)
    .where(like(issues.identifier, `${teamSlug}-%`));

  let max = 0;
  for (const row of rows) {
    const suffix = row.identifier.slice(teamSlug.length + 1);
    const n = Number.parseInt(suffix, 10);
    if (Number.isFinite(n) && n > max) {
      max = n;
    }
  }
  return `${teamSlug}-${max + 1}`;
}

async function nextRank(db: Db, teamSlug: string): Promise<string> {
  const rows = await db
    .select({ rank: issues.rank })
    .from(issues)
    .where(like(issues.identifier, `${teamSlug}-%`));

  let maxRank: string | null = null;
  for (const row of rows) {
    if (row.rank && (maxRank === null || row.rank > maxRank)) {
      maxRank = row.rank;
    }
  }

  if (!maxRank) {
    return new LexRank('a3c').toString();
  }

  try {
    return LexRank.from(maxRank).increment().toString();
  } catch {
    const parsed = LexRank.from(maxRank);
    return new LexRank(`${parsed.value}1`, parsed.bucket).toString();
  }
}

// ---------------------------------------------------------------------------
// DTO loading
// ---------------------------------------------------------------------------

/**
 * Load full issue DTOs (with status / priority / project / assignee / labels)
 * for the rows matching `where`. Uses batched lookups to avoid N+1 queries.
 */
async function loadIssueDTOs(db: Db, where: SQL): Promise<IssueDTO[]> {
  const rows = await db
    .select({
      id: issues.id,
      identifier: issues.identifier,
      title: issues.title,
      description: issues.description,
      cycleId: issues.cycleId,
      rank: issues.rank,
      createdAt: issues.createdAt,
      statusSlug: statuses.slug,
      statusName: statuses.name,
      statusColor: statuses.color,
      statusIcon: statuses.icon,
      prioritySlug: priorities.slug,
      priorityName: priorities.name,
      priorityIcon: priorities.icon,
      projectId: projects.id,
      projectName: projects.name,
      projectIcon: projects.icon,
      projectPercent: projects.percentComplete,
    })
    .from(issues)
    .leftJoin(statuses, eq(issues.statusId, statuses.id))
    .leftJoin(priorities, eq(issues.priorityId, priorities.id))
    .leftJoin(projects, eq(issues.projectId, projects.id))
    .where(where)
    .orderBy(desc(issues.rank), desc(issues.createdAt));

  if (rows.length === 0) {
    return [];
  }

  const issueIds = rows.map((row) => row.id);

  // Assignees (the UI models a single assignee per issue).
  const assigneeRows = await db
    .select({
      issueId: issueAssignees.issueId,
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      role: userTable.role,
      status: userTable.status,
      createdAt: userTable.createdAt,
    })
    .from(issueAssignees)
    .innerJoin(userTable, eq(issueAssignees.userId, userTable.id))
    .where(inArray(issueAssignees.issueId, issueIds));

  const assigneeByIssue = new Map<string, User>();
  for (const row of assigneeRows) {
    if (assigneeByIssue.has(row.issueId)) continue;
    assigneeByIssue.set(row.issueId, {
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.image,
      role: row.role ?? undefined,
      status: (row.status as UserStatus | null) ?? undefined,
      joinedDate: row.createdAt
        ? new Date(row.createdAt).toISOString()
        : undefined,
    });
  }

  // Labels.
  const labelRows = await db
    .select({
      issueId: issueLabels.issueId,
      id: labels.id,
      name: labels.name,
      color: labels.color,
    })
    .from(issueLabels)
    .innerJoin(labels, eq(issueLabels.labelId, labels.id))
    .where(inArray(issueLabels.issueId, issueIds));

  const labelsByIssue = new Map<
    string,
    Array<{ id: string; name: string; color: string }>
  >();
  for (const row of labelRows) {
    const list = labelsByIssue.get(row.issueId) ?? [];
    list.push({ id: row.id, name: row.name, color: row.color });
    labelsByIssue.set(row.issueId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    identifier: row.identifier,
    title: row.title,
    description: row.description ?? '',
    status: row.statusSlug
      ? {
          id: row.statusSlug,
          name: row.statusName ?? row.statusSlug,
          color: row.statusColor ?? '#888888',
          icon: row.statusIcon ?? 'circle',
        }
      : DEFAULT_STATUS,
    priority: row.prioritySlug
      ? {
          id: row.prioritySlug,
          name: row.priorityName ?? row.prioritySlug,
          icon: row.priorityIcon ?? 'circle',
        }
      : DEFAULT_PRIORITY,
    assignees: assigneeByIssue.get(row.id) ?? null,
    labels: labelsByIssue.get(row.id) ?? [],
    createdAt: row.createdAt ?? new Date().toISOString(),
    cycleId: row.cycleId ?? '',
    rank: row.rank ?? '',
    project: row.projectId
      ? {
          id: row.projectId,
          name: row.projectName ?? '',
          icon: row.projectIcon ?? 'folder',
          percentComplete: row.projectPercent ?? null,
        }
      : undefined,
  }));
}

async function loadIssueDTOById(
  db: Db,
  issueId: string
): Promise<IssueDTO | null> {
  const [dto] = await loadIssueDTOs(db, eq(issues.id, issueId));
  return dto ?? null;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * All issues for a team (by identifier prefix), scoped to the current user's
 * membership. Used to hydrate the board's initial state from D1.
 */
export async function getIssuesForTeam(teamSlug: string): Promise<IssueDTO[]> {
  const slugs = await getCurrentUserTeamSlugs();
  if (!slugs.includes(teamSlug)) {
    return [];
  }

  const db = getDb();
  return loadIssueDTOs(db, like(issues.identifier, `${teamSlug}-%`));
}

export async function getIssuesByProjectId(projectId: string) {
  const db = getDb();

  // Only return issues for a project that belongs to one of the user's teams
  // (D1 has no RLS).
  const userTeamIds = await getCurrentUserTeamIds();
  if (userTeamIds.length === 0) {
    return [];
  }

  const [allowed] = await db
    .select({ projectId: teamProjects.projectId })
    .from(teamProjects)
    .where(
      and(
        eq(teamProjects.projectId, projectId),
        inArray(teamProjects.teamId, userTeamIds)
      )
    )
    .limit(1);

  if (!allowed) {
    return [];
  }

  const rows = await db
    .select({
      id: issues.id,
      identifier: issues.identifier,
      title: issues.title,
      description: issues.description,
      createdAt: issues.createdAt,
      projectId: issues.projectId,
      statusId: statuses.id,
      statusName: statuses.name,
      statusSlug: statuses.slug,
      statusColor: statuses.color,
      statusIcon: statuses.icon,
      priorityId: priorities.id,
      priorityName: priorities.name,
      prioritySlug: priorities.slug,
      priorityIcon: priorities.icon,
    })
    .from(issues)
    .leftJoin(statuses, eq(issues.statusId, statuses.id))
    .leftJoin(priorities, eq(issues.priorityId, priorities.id))
    .where(eq(issues.projectId, projectId))
    .orderBy(desc(issues.createdAt));

  return rows.map((issue) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    created_at: issue.createdAt,
    project_id: issue.projectId,
    status: issue.statusId
      ? {
          id: issue.statusId,
          name: issue.statusName,
          slug: issue.statusSlug,
          color: issue.statusColor,
          icon: issue.statusIcon,
        }
      : null,
    priority: issue.priorityId
      ? {
          id: issue.priorityId,
          name: issue.priorityName,
          slug: issue.prioritySlug,
          icon: issue.priorityIcon,
        }
      : null,
  }));
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateIssueInput {
  title: string;
  description?: string;
  /** Status slug (as exposed by `getStatuses`). */
  statusId?: string | null;
  /** Priority slug (as exposed by `getPriorities`). */
  priorityId?: string | null;
  /** Assignee user id, or null for unassigned. */
  assigneeId?: string | null;
  /** Label ids. */
  labelIds?: string[];
  /** Project id, or null. */
  projectId?: string | null;
  /** Team slug to mint the identifier under. Falls back to the user's first team. */
  teamId?: string | null;
}

export async function createIssue(input: CreateIssueInput): Promise<IssueDTO> {
  const sessionUser = await requireUser();

  const title = input.title.trim();
  if (!title) {
    throw new Error('タイトルは必須です');
  }

  const slugs = await getCurrentUserTeamSlugs();
  if (slugs.length === 0) {
    throw new Error('所属チームがありません');
  }

  const teamSlug =
    input.teamId && slugs.includes(input.teamId) ? input.teamId : slugs[0];
  if (!teamSlug) {
    throw new Error('所属チームがありません');
  }

  const db = getDb();

  const [statusId, priorityId, identifier, rank] = await Promise.all([
    statusIdFromSlug(db, input.statusId),
    priorityIdFromSlug(db, input.priorityId),
    nextIdentifier(db, teamSlug),
    nextRank(db, teamSlug),
  ]);

  const id = crypto.randomUUID();

  await db.insert(issues).values({
    id,
    identifier,
    title,
    description: input.description ?? null,
    statusId,
    priorityId,
    projectId: input.projectId ?? null,
    rank,
    createdBy: sessionUser.id,
  });

  if (input.assigneeId) {
    await db.insert(issueAssignees).values({
      issueId: id,
      userId: input.assigneeId,
    });
  }

  if (input.labelIds && input.labelIds.length > 0) {
    await db
      .insert(issueLabels)
      .values(
        input.labelIds.map((labelId) => ({ issueId: id, labelId }))
      );
  }

  const dto = await loadIssueDTOById(db, id);
  if (!dto) {
    throw new Error('課題の作成に失敗しました');
  }
  return dto;
}

// ---------------------------------------------------------------------------
// Update / delete
// ---------------------------------------------------------------------------

export async function updateIssue(
  issueId: string,
  input: { title?: string; description?: string }
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);

  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) {
      throw new Error('タイトルは必須です');
    }
    patch.title = title;
  }
  if (input.description !== undefined) {
    patch.description = input.description;
  }

  await db.update(issues).set(patch).where(eq(issues.id, issueId));
}

export async function deleteIssue(issueId: string): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);
  // issue_assignees / issue_labels / issue_relations cascade on delete.
  await db.delete(issues).where(eq(issues.id, issueId));
}

export async function updateIssueStatus(
  issueId: string,
  statusSlug: string
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);

  const statusId = await statusIdFromSlug(db, statusSlug);
  await db
    .update(issues)
    .set({ statusId, updatedAt: nowIso() })
    .where(eq(issues.id, issueId));
}

export async function updateIssuePriority(
  issueId: string,
  prioritySlug: string
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);

  const priorityId = await priorityIdFromSlug(db, prioritySlug);
  await db
    .update(issues)
    .set({ priorityId, updatedAt: nowIso() })
    .where(eq(issues.id, issueId));
}

export async function updateIssueRank(
  issueId: string,
  rank: string
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);
  await db
    .update(issues)
    .set({ rank, updatedAt: nowIso() })
    .where(eq(issues.id, issueId));
}

// ---------------------------------------------------------------------------
// Assignee / labels (join tables)
// ---------------------------------------------------------------------------

export async function updateIssueAssignee(
  issueId: string,
  userId: string | null
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);

  // Single-assignee model: clear then set.
  await db.delete(issueAssignees).where(eq(issueAssignees.issueId, issueId));
  if (userId) {
    await db.insert(issueAssignees).values({ issueId, userId });
  }
}

export async function addIssueLabel(
  issueId: string,
  labelId: string
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);
  await db
    .insert(issueLabels)
    .values({ issueId, labelId })
    .onConflictDoNothing();
}

export async function removeIssueLabel(
  issueId: string,
  labelId: string
): Promise<void> {
  const db = getDb();
  await assertIssueAccess(db, issueId);
  await db
    .delete(issueLabels)
    .where(
      and(eq(issueLabels.issueId, issueId), eq(issueLabels.labelId, labelId))
    );
}

function nowIso(): string {
  return new Date().toISOString();
}
