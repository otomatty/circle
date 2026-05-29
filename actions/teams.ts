'use server';

import { getSupabase } from '~/lib/supabase/data';
import type { Team } from '~/types/teams';

export async function getTeams(): Promise<
  Array<
    Omit<Team, 'projects'> & {
      projects: Array<Omit<Team['projects'][0], 'icon'> & { icon: string }>;
    }
  >
> {
  const supabase = await getSupabase();

  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });

  if (teamsError) {
    console.error('Teams fetch error:', teamsError);
    throw new Error('チームデータの取得に失敗しました');
  }

  const teams = await Promise.all(
    (teamsData ?? []).map(async (team) => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('team_projects')
        .select(
          `
          project_id,
          projects (
            id,
            name,
            icon,
            status_id,
            percent_complete
          )
        `
        )
        .eq('team_id', team.id);

      if (projectsError) {
        console.error('Team projects fetch error:', projectsError);
      }

      const projects = (projectsData ?? []).flatMap((row) => {
        const raw = row.projects;
        const project = Array.isArray(raw) ? raw[0] : raw;
        if (!project) return [];
        return [
          {
            id: project.id,
            name: project.name,
            icon: project.icon ?? 'folder',
            percentComplete: project.percent_complete || 0,
            status: project.status_id ? { id: project.status_id } : null,
          },
        ];
      });

      return {
        id: team.slug,
        name: team.name,
        icon: team.icon,
        color: team.color ?? '#4f46e5',
        members: [],
        projects,
        joined: true,
      };
    })
  );

  return teams;
}

export async function getTeamSlugById(teamId: string): Promise<string | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('teams')
    .select('slug')
    .eq('id', teamId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.slug;
}

export async function getFirstTeamSlugForUser(
  userId: string
): Promise<string | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('team_members')
    .select('teams ( slug )')
    .eq('user_id', userId)
    .limit(1);

  if (!error && data?.[0]?.teams) {
    const teams = data[0].teams as { slug: string } | { slug: string }[];
    if (Array.isArray(teams)) {
      return teams[0]?.slug ?? null;
    }
    return teams.slug;
  }

  const { data: fallback } = await supabase
    .from('teams')
    .select('slug')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return fallback?.slug ?? null;
}
