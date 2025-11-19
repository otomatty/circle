'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';

/**
 * 特定のプロジェクトに関連するタスク(課題)一覧を取得します
 * @param projectId プロジェクトID
 */
export async function getIssuesByProjectId(projectId: string) {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const issues = db
        .prepare(
          `
        SELECT 
          i.id,
          i.identifier,
          i.title,
          i.description,
          i.created_at,
          i.project_id,
          s.id as status_id,
          s.name as status_name,
          s.slug as status_slug,
          s.color as status_color,
          s.icon as status_icon,
          p.id as priority_id,
          p.name as priority_name,
          p.slug as priority_slug,
          p.icon as priority_icon
        FROM issues i
        LEFT JOIN statuses s ON i.status_id = s.id
        LEFT JOIN priorities p ON i.priority_id = p.id
        WHERE i.project_id = ?
        ORDER BY i.created_at DESC
      `
        )
        .all(projectId) as Array<{
        id: string;
        identifier: string;
        title: string;
        description: string | null;
        created_at: string;
        project_id: string | null;
        status_id: string | null;
        status_name: string | null;
        status_slug: string | null;
        status_color: string | null;
        status_icon: string | null;
        priority_id: string | null;
        priority_name: string | null;
        priority_slug: string | null;
        priority_icon: string | null;
      }>;

      // Supabaseの形式に合わせてデータを整形
      return issues.map((issue) => ({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description,
        created_at: issue.created_at,
        project_id: issue.project_id,
        status: issue.status_id
          ? {
              id: issue.status_id,
              name: issue.status_name || '',
              slug: issue.status_slug || '',
              color: issue.status_color || null,
              icon: issue.status_icon || null,
            }
          : null,
        priority: issue.priority_id
          ? {
              id: issue.priority_id,
              name: issue.priority_name || '',
              slug: issue.priority_slug || '',
              icon: issue.priority_icon || null,
            }
          : null,
      }));
    },
    {
      actionName: 'getIssuesByProjectId',
      defaultErrorMessage: 'タスクの取得に失敗しました',
      i18nKey: 'errors.actions.getIssues',
    }
  );
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
