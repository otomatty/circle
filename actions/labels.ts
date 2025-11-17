'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { LabelInterface } from '~/types/labels';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * データベースからラベルリストを取得します
 */
export async function getLabels(): Promise<LabelInterface[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('labels')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Labels取得エラー:', error);
    throw new Error('ラベルデータの取得に失敗しました');
  }

  // DBデータをLabelInterfaceの形式に変換
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color || '#4f46e5',
  })) as LabelInterface[];
}

/**
 * ラベルごとの課題数を取得します
 */
export async function getLabelCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('issue_labels')
    .select('label_id');

  if (error) {
    console.error('Label counts 取得エラー:', error);
    throw new Error('ラベルカウントの取得に失敗しました');
  }

  // 各ラベルのカウントを集計
  const counts: Record<string, number> = {};

  // forEachの代わりにfor...ofを使用（lint対応）
  for (const item of data) {
    if (item.label_id) {
      counts[item.label_id] = (counts[item.label_id] || 0) + 1;
    }
  }

  return counts;
}
