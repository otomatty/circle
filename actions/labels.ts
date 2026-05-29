'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { LabelInterface } from '~/types/labels';

export async function getLabels(): Promise<LabelInterface[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Labels fetch error:', error);
    throw new Error('ラベルデータの取得に失敗しました');
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color || '#4f46e5',
  })) as LabelInterface[];
}

export async function getLabelCounts(): Promise<Record<string, number>> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('issue_labels')
    .select('label_id');

  if (error) {
    console.error('Label counts fetch error:', error);
    throw new Error('ラベルカウントの取得に失敗しました');
  }

  const counts: Record<string, number> = {};

  for (const item of data ?? []) {
    if (item.label_id) {
      counts[item.label_id] = (counts[item.label_id] || 0) + 1;
    }
  }

  return counts;
}
