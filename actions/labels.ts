'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';
import type { LabelInterface } from '~/types/labels';

/**
 * データベースからラベルリストを取得します
 */
export async function getLabels(): Promise<LabelInterface[]> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const labels = db
        .prepare('SELECT * FROM labels ORDER BY name ASC')
        .all() as Array<{
        id: string;
        name: string;
        color: string;
      }>;

      // DBデータをLabelInterfaceの形式に変換
      return labels.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color || '#4f46e5',
      })) as LabelInterface[];
    },
    {
      actionName: 'getLabels',
      defaultErrorMessage: 'ラベルデータの取得に失敗しました',
      i18nKey: 'errors.actions.getLabels',
    }
  );
}

/**
 * ラベルごとの課題数を取得します
 */
export async function getLabelCounts(): Promise<Record<string, number>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const issueLabels = db
        .prepare('SELECT label_id FROM issue_labels')
        .all() as Array<{
        label_id: string;
      }>;

      // 各ラベルのカウントを集計
      const counts: Record<string, number> = {};

      for (const item of issueLabels) {
        if (item.label_id) {
          counts[item.label_id] = (counts[item.label_id] || 0) + 1;
        }
      }

      return counts;
    },
    {
      actionName: 'getLabelCounts',
      defaultErrorMessage: 'ラベルカウントの取得に失敗しました',
      i18nKey: 'errors.actions.getLabelCounts',
    }
  );
}
