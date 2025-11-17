'use server';

import { getDatabase } from '~/lib/db/client';
import type { Team } from '~/types/teams';
import { getIconFromString } from '~/utils/icon-utils';

/**
 * チームの一覧とそれに紐づくプロジェクトを取得します
 */
export async function getTeams(): Promise<Team[]> {
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

      // プロジェクトデータを整形
      const projects = projectsData.map((projectData) => ({
        id: projectData.id,
        name: projectData.name,
        icon: getIconFromString(projectData.icon ?? 'folder'),
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

    return teams as Team[];
  } catch (error) {
    console.error('Teams取得エラー:', error);
    throw new Error('チームデータの取得に失敗しました');
  }
}
