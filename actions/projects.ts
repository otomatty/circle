'use server';

import { getDatabase } from '~/lib/db/client';
import type { Project } from '~/types/projects';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * データベースからプロジェクトリストを取得します
 */
export async function getProjects(): Promise<Project[]> {
  const db = getDatabase();

  try {
    const projects = db
      .prepare('SELECT * FROM projects ORDER BY name ASC')
      .all() as Array<{
      id: string;
      name: string;
      icon: string | null;
      status_id: string | null;
      percent_complete: number | null;
    }>;

    // DBデータをProjectの形式に変換（iconを文字列からコンポーネントに変換）
    return projects.map((item) => ({
      id: item.id,
      name: item.name,
      description: '', // descriptionはスキーマにないので空文字
      icon: getIconFromString(item.icon ?? 'folder'),
      color: '#4f46e5', // データベースにないのでデフォルト値のみ設定
      percentComplete: item.percent_complete || 0,
      status: item.status_id ? { id: item.status_id } : null,
    })) as unknown as Project[];
  } catch (error) {
    console.error('Projects取得エラー:', error);
    throw new Error('プロジェクトデータの取得に失敗しました');
  }
}

/**
 * プロジェクトごとの課題数を取得します
 */
export async function getProjectCounts(): Promise<Record<string, number>> {
  const db = getDatabase();

  try {
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
  } catch (error) {
    console.error('Project counts 取得エラー:', error);
    throw new Error('プロジェクトカウントの取得に失敗しました');
  }
}
