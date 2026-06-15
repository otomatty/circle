'use server';

import { asc, eq, sql } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import { issues, statuses } from '~/lib/db/schema';
import type { Status } from '~/types/status';

export async function getStatuses(): Promise<
  Array<Omit<Status, 'icon'> & { icon: string }>
> {
  const db = getDb();

  const rows = await db
    .select()
    .from(statuses)
    .orderBy(asc(statuses.displayOrder));

  return rows.map((item) => ({
    id: item.slug,
    name: item.name,
    icon: item.icon ?? 'circle',
    color: item.color || '#4f46e5',
  }));
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const rows = await db
    .select({
      slug: statuses.slug,
      count: sql<number>`count(*)`,
    })
    .from(issues)
    .innerJoin(statuses, eq(issues.statusId, statuses.id))
    .groupBy(statuses.slug);

  const counts: Record<string, number> = {};
  for (const item of rows) {
    if (item.slug) {
      counts[item.slug] = Number(item.count);
    }
  }
  return counts;
}
