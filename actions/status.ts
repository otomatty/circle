'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { Status } from '~/types/status';

export async function getStatuses(): Promise<
  Array<Omit<Status, 'icon'> & { icon: string }>
> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('statuses')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Statuses fetch error:', error);
    throw new Error('ステータスデータの取得に失敗しました');
  }

  return (data ?? []).map((item) => ({
    id: item.slug,
    name: item.name,
    icon: item.icon ?? 'circle',
    color: item.color || '#4f46e5',
  }));
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  const supabase = await getSupabase();

  const { data, error } = await supabase.from('issues').select(`
      status_id,
      statuses ( slug )
    `);

  if (error) {
    console.error('Status counts fetch error:', error);
    throw new Error('ステータスカウントの取得に失敗しました');
  }

  const counts: Record<string, number> = {};

  for (const item of data ?? []) {
    const raw = item.statuses;
    const status = Array.isArray(raw) ? raw[0] : raw;
    if (status?.slug) {
      counts[status.slug] = (counts[status.slug] || 0) + 1;
    }
  }

  return counts;
}
