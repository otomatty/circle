'use server';

import { desc, eq } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import { issues, priorities, statuses } from '~/lib/db/schema';

export async function getIssuesByProjectId(projectId: string) {
  const db = getDb();

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
