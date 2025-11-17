'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Project } from '~/types/projects';
import { getIconFromString } from '~/utils/icon-utils';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * データベースからプロジェクトリストを取得します
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('projects')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Projects取得エラー:', error);
    throw new Error('プロジェクトデータの取得に失敗しました');
  }

  // DBデータをProjectの形式に変換（iconを文字列からコンポーネントに変換）
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.slug || '', // descriptionの代わりにslugを使用
    icon: getIconFromString(item.icon ?? 'folder'),
    color: '#4f46e5', // データベースにないのでデフォルト値のみ設定
    percentComplete: item.percent_complete || 0, // スネークケースからキャメルケースに変換
    status: item.status_id ? { id: item.status_id } : null,
  })) as unknown as Project[];
}

/**
 * プロジェクトごとの課題数を取得します
 */
export async function getProjectCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  // プロジェクトに紐づいた課題
  const { data: projectIssues, error: projectError } = await supabase
    .schema('circle')
    .from('issues')
    .select('project_id')
    .not('project_id', 'is', null);

  if (projectError) {
    console.error('Project counts 取得エラー:', projectError);
    throw new Error('プロジェクトカウントの取得に失敗しました');
  }

  // プロジェクトなしの課題数を取得
  const { count: noProjectCount, error: noProjectError } = await supabase
    .schema('circle')
    .from('issues')
    .select('*', { count: 'exact', head: true })
    .is('project_id', null);

  if (noProjectError) {
    console.error('No-project count 取得エラー:', noProjectError);
    throw new Error('プロジェクトなし課題カウントの取得に失敗しました');
  }

  // 各プロジェクトのカウントを集計
  const counts: Record<string, number> = {
    'no-project': noProjectCount || 0,
  };

  // forEachの代わりにfor...ofを使用（lint対応）
  for (const item of projectIssues) {
    if (item.project_id) {
      counts[item.project_id] = (counts[item.project_id] || 0) + 1;
    }
  }

  return counts;
}
