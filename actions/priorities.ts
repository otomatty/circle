'use server';

import { asc, eq, sql } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import { issues, priorities } from '~/lib/db/schema';
import type { Priority } from '~/types/priorities';

export async function getPriorities(): Promise<
  Array<Omit<Priority, 'icon'> & { icon: string }>
> {
  const db = getDb();

  const rows = await db
    .select()
    .from(priorities)
    .orderBy(asc(priorities.displayOrder));

  return rows.map((item) => ({
    id: item.slug,
    name: item.name,
    icon: item.icon ?? 'circle',
  }));
}

export async function getPriorityCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const rows = await db
    .select({
      slug: priorities.slug,
      count: sql<number>`count(*)`,
    })
    .from(issues)
    .innerJoin(priorities, eq(issues.priorityId, priorities.id))
    .groupBy(priorities.slug);

  const counts: Record<string, number> = {};
  for (const item of rows) {
    if (item.slug) {
      counts[item.slug] = Number(item.count);
    }
  }
  return counts;
}
