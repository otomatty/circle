'use server';

import { asc, sql } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import { issueLabels, labels } from '~/lib/db/schema';
import type { LabelInterface } from '~/types/labels';

export async function getLabels(): Promise<LabelInterface[]> {
  const db = getDb();

  const rows = await db
    .select({ id: labels.id, name: labels.name, color: labels.color })
    .from(labels)
    .orderBy(asc(labels.name));

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color || '#4f46e5',
  })) as LabelInterface[];
}

export async function getLabelCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const rows = await db
    .select({
      labelId: issueLabels.labelId,
      count: sql<number>`count(*)`,
    })
    .from(issueLabels)
    .groupBy(issueLabels.labelId);

  const counts: Record<string, number> = {};
  for (const item of rows) {
    if (item.labelId) {
      counts[item.labelId] = Number(item.count);
    }
  }
  return counts;
}
