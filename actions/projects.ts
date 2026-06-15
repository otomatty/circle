'use server';

import { asc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';

import { getCurrentUserTeamIds } from '~/lib/auth-server';
import { getDb } from '~/lib/db';
import { issues, projects, statuses, teamProjects } from '~/lib/db/schema';
import type { Project } from '~/types/projects';

export async function getProjects(): Promise<
  Array<Omit<Project, 'icon'> & { icon: string }>
> {
  const db = getDb();

  // Scope to projects belonging to the current user's teams (D1 has no RLS).
  const userTeamIds = await getCurrentUserTeamIds();
  if (userTeamIds.length === 0) {
    return [];
  }

  const rows = await db
    .selectDistinct({
      id: projects.id,
      name: projects.name,
      icon: projects.icon,
      percentComplete: projects.percentComplete,
      statusId: projects.statusId,
      statusName: statuses.name,
      statusIcon: statuses.icon,
      statusColor: statuses.color,
    })
    .from(projects)
    .innerJoin(teamProjects, eq(teamProjects.projectId, projects.id))
    .leftJoin(statuses, eq(projects.statusId, statuses.id))
    .where(inArray(teamProjects.teamId, userTeamIds))
    .orderBy(asc(projects.name));

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    description: '',
    icon: item.icon ?? 'folder',
    color: '#4f46e5',
    percentComplete: item.percentComplete || 0,
    status: item.statusId
      ? ({
          id: item.statusId,
          name: item.statusName ?? item.statusId,
          icon: item.statusIcon ?? 'circle',
          color: item.statusColor ?? '#4f46e5',
        } as Project['status'])
      : undefined,
  }));
}

export async function getProjectCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const projectIssues = await db
    .select({
      projectId: issues.projectId,
      count: sql<number>`count(*)`,
    })
    .from(issues)
    .where(isNotNull(issues.projectId))
    .groupBy(issues.projectId);

  const [{ count: noProjectCount } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(issues)
    .where(isNull(issues.projectId));

  const counts: Record<string, number> = {
    'no-project': Number(noProjectCount ?? 0),
  };

  for (const item of projectIssues) {
    if (item.projectId) {
      counts[item.projectId] = Number(item.count);
    }
  }

  return counts;
}
