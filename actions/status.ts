'use server';

import { getDatabase } from '~/lib/db/client';
import type { Status } from '~/types/status';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * データベースからステータスリストを取得します
 */
export async function getStatuses(): Promise<Status[]> {
  const db = getDatabase();

  try {
    const statuses = db
      .prepare('SELECT * FROM statuses ORDER BY display_order ASC')
      .all() as Array<{
      id: string;
      slug: string;
      name: string;
      color: string | null;
      icon: string | null;
    }>;

    // DBデータをStatusの形式に変換（iconを文字列からコンポーネントに変換）
    return statuses.map((item) => ({
      id: item.slug,
      name: item.name,
      icon: getIconFromString(item.icon ?? 'circle'),
      color: item.color || '#4f46e5',
    })) as Status[];
  } catch (error) {
    console.error('Statuses取得エラー:', error);
    throw new Error('ステータスデータの取得に失敗しました');
  }
}

/**
 * ステータスごとの課題数を取得します
 */
export async function getStatusCounts(): Promise<Record<string, number>> {
  const db = getDatabase();

  try {
    const issues = db
      .prepare(
        `
        SELECT i.status_id, s.slug
        FROM issues i
        INNER JOIN statuses s ON i.status_id = s.id
        WHERE i.status_id IS NOT NULL
      `
      )
      .all() as Array<{
      status_id: string;
      slug: string;
    }>;

    // 各ステータスのカウントを集計
    const counts: Record<string, number> = {};

    for (const item of issues) {
      if (item.slug) {
        counts[item.slug] = (counts[item.slug] || 0) + 1;
      }
    }

    return counts;
  } catch (error) {
    console.error('Status counts 取得エラー:', error);
    throw new Error('ステータスカウントの取得に失敗しました');
  }
}
