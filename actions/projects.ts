'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { Project } from '~/types/projects';

export async function getProjects(): Promise<
  Array<Omit<Project, 'icon'> & { icon: string }>
> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Projects fetch error:', error);
    throw new Error('プロジェクトデータの取得に失敗しました');
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    description: '',
    icon: item.icon ?? 'folder',
    color: '#4f46e5',
    percentComplete: item.percent_complete || 0,
    status: item.status_id
      ? ({
          id: item.status_id,
          name: item.status_id,
          icon: 'circle',
          color: '#4f46e5',
        } as Project['status'])
      : undefined,
  }));
}

export async function getProjectCounts(): Promise<Record<string, number>> {
  const supabase = await getSupabase();

  const { data: projectIssues, error } = await supabase
    .from('issues')
    .select('project_id')
    .not('project_id', 'is', null);

  if (error) {
    console.error('Project counts fetch error:', error);
    throw new Error('プロジェクトカウントの取得に失敗しました');
  }

  const { count: noProjectCount, error: noProjectError } = await supabase
    .from('issues')
    .select('id', { count: 'exact', head: true })
    .is('project_id', null);

  if (noProjectError) {
    console.error('No-project count fetch error:', noProjectError);
  }

  const counts: Record<string, number> = {
    'no-project': noProjectCount ?? 0,
  };

  for (const item of projectIssues ?? []) {
    if (item.project_id) {
      counts[item.project_id] = (counts[item.project_id] || 0) + 1;
    }
  }

  return counts;
}
