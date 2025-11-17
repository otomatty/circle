'use server';

import { getDatabase } from '~/lib/db/client';
import type { Team } from '~/types/teams';

/**
 * チームの一覧とそれに紐づくプロジェクトを取得します
 * Server Actionsではシリアライズ可能なデータのみを返すため、iconは文字列として返します
 */
export async function getTeams(): Promise<Array<Omit<Team, 'projects'> & { projects: Array<Omit<Team['projects'][0], 'icon'> & { icon: string }> }>> {
  const db = getDatabase();

  try {
    // チームの基本情報を取得
    const teamsData = db
      .prepare('SELECT * FROM teams')
      .all() as Array<{
      id: string;
      slug: string;
      name: string;
      icon: string | null;
      color: string | null;
    }>;

    // チームごとのプロジェクト情報を取得
    const teams = teamsData.map((team) => {
      // チームに関連するプロジェクトを取得
      const projectsData = db
        .prepare(
          `
          SELECT 
            p.id,
            p.name,
            p.icon,
            p.status_id,
            p.percent_complete
          FROM team_projects tp
          INNER JOIN projects p ON tp.project_id = p.id
          WHERE tp.team_id = ?
        `
        )
        .all(team.id) as Array<{
        id: string;
        name: string;
        icon: string | null;
        status_id: string | null;
        percent_complete: number | null;
      }>;

      // プロジェクトデータを整形（iconは文字列のまま返す）
      const projects = projectsData.map((projectData) => ({
        id: projectData.id,
        name: projectData.name,
        icon: projectData.icon ?? 'folder', // 文字列として返す
        percentComplete: projectData.percent_complete || 0,
        status: projectData.status_id ? { id: projectData.status_id } : null,
      }));

      return {
        id: team.slug,
        name: team.name,
        icon: team.icon,
        projects,
        joined: true, // デフォルトはtrueとする
      };
    });

    return teams;
  } catch (error) {
    console.error('Teams取得エラー:', error);
    throw new Error('チームデータの取得に失敗しました');
  }
}
