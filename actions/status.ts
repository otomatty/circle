'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Status } from '~/types/status';
import { getIconFromString } from '~/utils/icon-utils';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * データベースからステータスリストを取得します
 */
export async function getStatuses(): Promise<Status[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('statuses')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Statuses取得エラー:', error);
    throw new Error('ステータスデータの取得に失敗しました');
  }

  // DBデータをStatusの形式に変換（iconを文字列からコンポーネントに変換）
  return data.map((item) => ({
    id: item.slug,
    name: item.name,
    icon: getIconFromString(item.icon ?? 'circle'),
    color: item.color,
  })) as Status[];
}

/**
 * ステータスごとの課題数を取得します
 */
export async function getStatusCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('issues')
    .select('status_id, statuses:status_id(slug)')
    .not('status_id', 'is', null);

  if (error) {
    console.error('Status counts 取得エラー:', error);
    throw new Error('ステータスカウントの取得に失敗しました');
  }

  // 各ステータスのカウントを集計
  const counts: Record<string, number> = {};

  // forEachの代わりにfor...ofを使用（lint対応）
  for (const item of data) {
    if (item.statuses?.slug) {
      const statusId = item.statuses.slug;
      counts[statusId] = (counts[statusId] || 0) + 1;
    }
  }

  return counts;
}
