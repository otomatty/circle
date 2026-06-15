'use server';

import { asc, eq, inArray } from 'drizzle-orm';

import { getCurrentUserTeamIds } from '~/lib/auth-server';
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

  // Scope to the teams the current user belongs to (D1 has no RLS).
  const userTeamIds = await getCurrentUserTeamIds();
  if (userTeamIds.length === 0) {
    return [];
  }

  const teamsData = await db
    .select()
    .from(teams)
    .where(inArray(teams.id, userTeamIds))
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

  // Membership-only: never fall back to an arbitrary team the user does not
  // belong to (D1 has no RLS). New users are auto-joined to the default team.
  const rows = await db
    .select({ slug: teams.slug })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .orderBy(asc(teams.createdAt))
    .limit(1);

  return rows[0]?.slug ?? null;
}
