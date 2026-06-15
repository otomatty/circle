'use server';

import { asc, eq } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import {
  projects,
  teamMembers,
  teamProjects,
  teams,
} from '~/lib/db/schema';
import type { Team } from '~/types/teams';

export async function getTeams(): Promise<
  Array<
    Omit<Team, 'projects'> & {
      projects: Array<Omit<Team['projects'][0], 'icon'> & { icon: string }>;
    }
  >
> {
  const db = getDb();

  const teamsData = await db
    .select()
    .from(teams)
    .orderBy(asc(teams.createdAt));

  const projectRows = await db
    .select({
      teamId: teamProjects.teamId,
      id: projects.id,
      name: projects.name,
      icon: projects.icon,
      statusId: projects.statusId,
      percentComplete: projects.percentComplete,
    })
    .from(teamProjects)
    .innerJoin(projects, eq(teamProjects.projectId, projects.id));

  return teamsData.map((team) => ({
    id: team.slug,
    name: team.name,
    icon: team.icon,
    color: team.color ?? '#4f46e5',
    members: [],
    projects: projectRows
      .filter((row) => row.teamId === team.id)
      .map((project) => ({
        id: project.id,
        name: project.name,
        icon: project.icon ?? 'folder',
        percentComplete: project.percentComplete || 0,
        status: project.statusId ? { id: project.statusId } : null,
      })),
    joined: true,
  }));
}

export async function getTeamSlugById(teamId: string): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ slug: teams.slug })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  return rows[0]?.slug ?? null;
}

export async function getFirstTeamSlugForUser(
  userId: string
): Promise<string | null> {
  const db = getDb();

  const rows = await db
    .select({ slug: teams.slug })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (rows[0]?.slug) {
    return rows[0].slug;
  }

  const fallback = await db
    .select({ slug: teams.slug })
    .from(teams)
    .orderBy(asc(teams.createdAt))
    .limit(1);

  return fallback[0]?.slug ?? null;
}
