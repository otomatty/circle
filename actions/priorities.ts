'use server';

import { getDatabase } from '~/lib/db/client';
import type { Priority } from '~/types/priorities';

/**
 * データベースから優先度リストを取得します
 * Server Actionsではシリアライズ可能なデータのみを返すため、iconは文字列として返します
 */
export async function getPriorities(): Promise<Array<Omit<Priority, 'icon'> & { icon: string }>> {
  const db = getDatabase();

  try {
    const priorities = db
      .prepare('SELECT * FROM priorities ORDER BY display_order ASC')
      .all() as Array<{
      id: string;
      slug: string;
      name: string;
      icon: string | null;
    }>;

    // DBデータをPriorityの形式に変換（iconは文字列のまま返す）
    return priorities.map((item) => ({
      id: item.slug,
      name: item.name,
      icon: item.icon ?? 'circle', // 文字列として返す
    }));
  } catch (error) {
    console.error('Priorities取得エラー:', error);
    throw new Error('優先度データの取得に失敗しました');
  }
}

/**
 * 優先度ごとの課題数を取得します
 */
export async function getPriorityCounts(): Promise<Record<string, number>> {
  const db = getDatabase();

  try {
    const issues = db
      .prepare(
        `
        SELECT i.priority_id, p.slug
        FROM issues i
        INNER JOIN priorities p ON i.priority_id = p.id
        WHERE i.priority_id IS NOT NULL
      `
      )
      .all() as Array<{
      priority_id: string;
      slug: string;
    }>;

    // 各優先度のカウントを集計
    const counts: Record<string, number> = {};

    for (const item of issues) {
      if (item.slug) {
        counts[item.slug] = (counts[item.slug] || 0) + 1;
      }
    }

    return counts;
  } catch (error) {
    console.error('Priority counts 取得エラー:', error);
    throw new Error('優先度カウントの取得に失敗しました');
  }
}
