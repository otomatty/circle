'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';
import type { Status } from '~/types/status';

/**
 * データベースからステータスリストを取得します
 * Server Actionsではシリアライズ可能なデータのみを返すため、iconは文字列として返します
 */
export async function getStatuses(): Promise<Array<Omit<Status, 'icon'> & { icon: string }>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const statuses = db
        .prepare('SELECT * FROM statuses ORDER BY display_order ASC')
        .all() as Array<{
        id: string;
        slug: string;
        name: string;
        color: string | null;
        icon: string | null;
      }>;

      // DBデータをStatusの形式に変換（iconは文字列のまま返す）
      return statuses.map((item) => ({
        id: item.slug,
        name: item.name,
        icon: item.icon ?? 'circle', // 文字列として返す
        color: item.color || '#4f46e5',
      }));
    },
    {
      actionName: 'getStatuses',
      defaultErrorMessage: 'ステータスデータの取得に失敗しました',
      i18nKey: 'errors.actions.getStatus',
    }
  );
}

/**
 * ステータスごとの課題数を取得します
 */
export async function getStatusCounts(): Promise<Record<string, number>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

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
    },
    {
      actionName: 'getStatusCounts',
      defaultErrorMessage: 'ステータスカウントの取得に失敗しました',
      i18nKey: 'errors.actions.getStatusCounts',
    }
  );
}
