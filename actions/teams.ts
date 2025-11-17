'use server';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Team } from '~/types/teams';
import type { Database as CircleDatabase } from '@kit/supabase/circle-database';

// プロジェクトデータの型を定義
type ProjectRecord = {
  id: string;
  name: string;
  icon: string | null;
  status_id: string | null;
  percent_complete: number | null;
};

/**
 * チームの一覧とそれに紐づくプロジェクトを取得します
 */
export async function getTeams(): Promise<Team[]> {
  const supabase = getSupabaseServerClient<CircleDatabase>();

  // まずチームの基本情報を取得
  const { data: teamsData, error: teamsError } = await supabase
    .schema('circle')
    .from('teams')
    .select('*');

  if (teamsError) {
    console.error('Teams取得エラー:', teamsError);
    throw new Error('チームデータの取得に失敗しました');
  }

  // チームごとのプロジェクト情報を取得
  const teams = await Promise.all(
    teamsData.map(async (team) => {
      // チームに関連するプロジェクトを取得
      const { data: projectsData, error: projectsError } = await supabase
        .schema('circle')
        .from('team_projects')
        .select(`
          project_id,
          projects:project_id (
            id,
            name,
            icon,
            status_id,
            percent_complete
          )
        `)
        .eq('team_id', team.id);

      if (projectsError) {
        console.error(
          `Team ${team.name} のプロジェクト取得エラー:`,
          projectsError
        );
        return {
          id: team.slug,
          name: team.name,
          icon: team.icon,
          projects: [],
          joined: true, // デフォルトはtrueとする
        };
      }

      // プロジェクトデータを整形
      const projects = projectsData.map((item) => {
        // item.projectsはオブジェクトとして扱う
        const projectData = item.projects as ProjectRecord;
        return {
          id: projectData.id,
          name: projectData.name,
          icon: {
            name: projectData.icon ?? 'folder',
          },
          percentComplete: projectData.percent_complete,
          // statusはモックデータと互換性を持たせるため簡易的に設定
          status: {
            id: projectData.status_id,
          },
        };
      });

      return {
        id: team.slug,
        name: team.name,
        icon: team.icon,
        projects,
        joined: true, // デフォルトはtrueとする
      };
    })
  );

  return teams as Team[];
}
