'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Priority } from '~/types/priorities';
import { getIconFromString } from '~/utils/icon-utils';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * データベースから優先度リストを取得します
 */
export async function getPriorities(): Promise<Priority[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('priorities')
    .select('*');

  if (error) {
    console.error('Priorities取得エラー:', error);
    throw new Error('優先度データの取得に失敗しました');
  }

  // DBデータをPriorityの形式に変換（iconを文字列からコンポーネントに変換）
  return data.map((item) => ({
    id: item.slug,
    name: item.name,
    icon: getIconFromString(item.icon ?? 'circle'),
  })) as Priority[];
}

/**
 * 優先度ごとの課題数を取得します
 */
export async function getPriorityCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('issues')
    .select('priority_id, priorities:priority_id(slug)')
    .not('priority_id', 'is', null);

  if (error) {
    console.error('Priority counts 取得エラー:', error);
    throw new Error('優先度カウントの取得に失敗しました');
  }

  // 各優先度のカウントを集計
  const counts: Record<string, number> = {};

  // forEachの代わりにfor...ofを使用（lint対応）
  for (const item of data) {
    if (item.priorities?.slug) {
      const priorityId = item.priorities.slug;
      counts[priorityId] = (counts[priorityId] || 0) + 1;
    }
  }

  return counts;
}
