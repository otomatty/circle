'use server';

import { getDatabase } from '~/lib/db/client';
import { handleDatabaseAction } from '~/lib/errors/handler';
import type { Team } from '~/types/teams';

/**
 * チームの一覧とそれに紐づくプロジェクトを取得します
 * Server Actionsではシリアライズ可能なデータのみを返すため、iconは文字列として返します
 */
export async function getTeams(): Promise<Array<Omit<Team, 'projects'> & { projects: Array<Omit<Team['projects'][0], 'icon'> & { icon: string }> }>> {
  return handleDatabaseAction(
    async () => {
      const db = getDatabase();

      // チームとプロジェクトを一度のJOINクエリで取得（N+1問題を解決）
      const teamsWithProjects = db
          .prepare(
            `
          SELECT 
          t.id as team_id,
          t.slug as team_slug,
          t.name as team_name,
          t.icon as team_icon,
          t.color as team_color,
          p.id as project_id,
          p.name as project_name,
          p.icon as project_icon,
          p.status_id as project_status_id,
          p.percent_complete as project_percent_complete
        FROM teams t
        LEFT JOIN team_projects tp ON t.id = tp.team_id
        LEFT JOIN projects p ON tp.project_id = p.id
        ORDER BY t.id, p.id
      `
        )
        .all() as Array<{
        team_id: string;
        team_slug: string;
        team_name: string;
        team_icon: string | null;
        team_color: string | null;
        project_id: string | null;
        project_name: string | null;
        project_icon: string | null;
        project_status_id: string | null;
        project_percent_complete: number | null;
      }>;

      // データをチームごとにグループ化
      const teamsMap = new Map<
        string,
        {
          id: string;
          name: string;
          icon: string | null;
          color: string | null;
          projects: Array<{
            id: string;
            name: string;
            icon: string;
            percentComplete: number;
            status: { id: string } | null;
        }>;
        }
      >();

      for (const row of teamsWithProjects) {
        if (!teamsMap.has(row.team_id)) {
          teamsMap.set(row.team_id, {
            id: row.team_slug,
            name: row.team_name,
            icon: row.team_icon,
            color: row.team_color,
            projects: [],
          });
        }

        const team = teamsMap.get(row.team_id)!;

        // プロジェクトが存在する場合のみ追加
        if (row.project_id) {
          team.projects.push({
            id: row.project_id,
            name: row.project_name!,
            icon: row.project_icon ?? 'folder',
            percentComplete: row.project_percent_complete || 0,
            status: row.project_status_id ? { id: row.project_status_id } : null,
          });
        }
      }

      // Mapから配列に変換し、joinedプロパティを追加
      return Array.from(teamsMap.values()).map((team) => ({
        ...team,
          joined: true, // デフォルトはtrueとする
      }));
    },
    {
      actionName: 'getTeams',
      defaultErrorMessage: 'チームデータの取得に失敗しました',
      i18nKey: 'errors.actions.getTeams',
    }
  );
}
