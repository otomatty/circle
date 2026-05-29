'use server';

import { getSupabase } from '~/lib/supabase/data';

export async function getIssuesByProjectId(projectId: string) {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('issues')
    .select(
      `
      id,
      identifier,
      title,
      description,
      created_at,
      project_id,
      statuses (
        id,
        name,
        slug,
        color,
        icon
      ),
      priorities (
        id,
        name,
        slug,
        icon
      )
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Project ${projectId} issues fetch error:`, error);
    throw new Error('タスクの取得に失敗しました');
  }

  return (data ?? []).map((issue) => {
    const status = issue.statuses as {
      id: string;
      name: string;
      slug: string;
      color: string | null;
      icon: string | null;
    } | null;
    const priority = issue.priorities as {
      id: string;
      name: string;
      slug: string;
      icon: string | null;
    } | null;

    return {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description,
      created_at: issue.created_at,
      project_id: issue.project_id,
      status: status
        ? {
            id: status.id,
            name: status.name,
            slug: status.slug,
            color: status.color,
            icon: status.icon,
          }
        : null,
      priority: priority
        ? {
            id: priority.id,
            name: priority.name,
            slug: priority.slug,
            icon: priority.icon,
          }
        : null,
    };
  });
}
