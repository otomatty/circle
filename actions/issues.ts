'use server';

import { and, desc, eq, inArray } from 'drizzle-orm';

import { getCurrentUserTeamIds } from '~/lib/auth-server';
import { getDb } from '~/lib/db';
import { issues, priorities, statuses, teamProjects } from '~/lib/db/schema';

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
