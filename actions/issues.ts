'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

/**
 * 特定のプロジェクトに関連するタスク(課題)一覧を取得します
 * @param projectId プロジェクトID
 */
export async function getIssuesByProjectId(projectId: string) {
  // 両方のスキーマを統合した型を指定
  const supabase = getSupabaseServerClient<CircleDatabase>();

  const { data, error } = await supabase
    .schema('circle')
    .from('issues')
    .select(`
      id,
      identifier,
      title,
      description,
      status:status_id (id, name, slug, color, icon),
      priority:priority_id (id, name, slug, icon),
      created_at,
      project_id
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`プロジェクト ${projectId} のタスク取得エラー:`, error);
    throw new Error('タスクの取得に失敗しました');
  }

  return data;
}

// 以下は将来的に実装するCRUD操作
/**
 * 新しいタスクを作成します
 * TODO: 実装
 */
// export async function createIssue() {...}

/**
 * タスクを更新します
 * TODO: 実装
 */
// export async function updateIssue() {...}

/**
 * タスクを削除します
 * TODO: 実装
 */
// export async function deleteIssue() {...}
