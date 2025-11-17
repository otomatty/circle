'use server';

import { getDatabase } from '~/lib/db/client';
import type { LabelInterface } from '~/types/labels';

/**
 * データベースからラベルリストを取得します
 */
export async function getLabels(): Promise<LabelInterface[]> {
  const db = getDatabase();

  try {
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
  } catch (error) {
    console.error('Labels取得エラー:', error);
    throw new Error('ラベルデータの取得に失敗しました');
  }
}

/**
 * ラベルごとの課題数を取得します
 */
export async function getLabelCounts(): Promise<Record<string, number>> {
  const db = getDatabase();

  try {
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
  } catch (error) {
    console.error('Label counts 取得エラー:', error);
    throw new Error('ラベルカウントの取得に失敗しました');
  }
}
