'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { Priority } from '~/types/priorities';

export async function getPriorities(): Promise<
  Array<Omit<Priority, 'icon'> & { icon: string }>
> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('priorities')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Priorities fetch error:', error);
    throw new Error('優先度データの取得に失敗しました');
  }

  return (data ?? []).map((item) => ({
    id: item.slug,
    name: item.name,
    icon: item.icon ?? 'circle',
  }));
}

export async function getPriorityCounts(): Promise<Record<string, number>> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from('issues').select(`
      priority_id,
      priorities ( slug )
    `);

  if (error) {
    console.error('Priority counts fetch error:', error);
    throw new Error('優先度カウントの取得に失敗しました');
  }

  const counts: Record<string, number> = {};

  for (const item of data ?? []) {
    const raw = item.priorities;
    const priority = Array.isArray(raw) ? raw[0] : raw;
    if (priority?.slug) {
      counts[priority.slug] = (counts[priority.slug] || 0) + 1;
    }
  }

  return counts;
}
