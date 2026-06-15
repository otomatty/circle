'use server';

import { asc, isNotNull, isNull, sql } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import { issues, projects } from '~/lib/db/schema';
import type { Project } from '~/types/projects';

export async function getProjects(): Promise<
  Array<Omit<Project, 'icon'> & { icon: string }>
> {
  const db = getDb();

  const rows = await db.select().from(projects).orderBy(asc(projects.name));

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
          name: item.statusId,
          icon: 'circle',
          color: '#4f46e5',
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
