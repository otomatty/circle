'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';
import type { Project } from '~/types/projects';

/**
 * データベースからプロジェクトリストを取得します
 * Server Actionsではシリアライズ可能なデータのみを返すため、iconは文字列として返します
 */
export async function getProjects(): Promise<Array<Omit<Project, 'icon'> & { icon: string }>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      const projects = db
        .prepare('SELECT * FROM projects ORDER BY name ASC')
        .all() as Array<{
        id: string;
        name: string;
        icon: string | null;
        status_id: string | null;
        percent_complete: number | null;
      }>;

      // DBデータをProjectの形式に変換（iconは文字列のまま返す）
      return projects.map((item) => ({
        id: item.id,
        name: item.name,
        description: '', // descriptionはスキーマにないので空文字
        icon: item.icon ?? 'folder', // 文字列として返す
        color: '#4f46e5', // データベースにないのでデフォルト値のみ設定
        percentComplete: item.percent_complete || 0,
        status: item.status_id ? { id: item.status_id } : null,
      }));
    },
    {
      actionName: 'getProjects',
      defaultErrorMessage: 'プロジェクトデータの取得に失敗しました',
      i18nKey: 'errors.actions.getProjects',
    }
  );
}

/**
 * プロジェクトごとの課題数を取得します
 */
export async function getProjectCounts(): Promise<Record<string, number>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      // プロジェクトに紐づいた課題
      const projectIssues = db
        .prepare('SELECT project_id FROM issues WHERE project_id IS NOT NULL')
        .all() as Array<{
        project_id: string;
      }>;

      // プロジェクトなしの課題数を取得
      const noProjectCount = db
        .prepare(
          'SELECT COUNT(*) as count FROM issues WHERE project_id IS NULL'
        )
        .get() as { count: number } | undefined;

      // 各プロジェクトのカウントを集計
      const counts: Record<string, number> = {
        'no-project': noProjectCount?.count || 0,
      };

      for (const item of projectIssues) {
        if (item.project_id) {
          counts[item.project_id] = (counts[item.project_id] || 0) + 1;
        }
      }

      return counts;
    },
    {
      actionName: 'getProjectCounts',
      defaultErrorMessage: 'プロジェクトカウントの取得に失敗しました',
      i18nKey: 'errors.actions.getProjectCounts',
    }
  );
}
