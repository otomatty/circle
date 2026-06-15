'use server';

import { asc, sql } from 'drizzle-orm';

import { getDb } from '~/lib/db';
import {
  issueAssignees,
  issues,
  teamMembers,
  user as userTable,
} from '~/lib/db/schema';
import type { User, UserStatus } from '~/types/users';

export async function getUsers(): Promise<User[]> {
  const db = getDb();

  const profiles = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      role: userTable.role,
      status: userTable.status,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(asc(userTable.name));

  const memberships = await db
    .select({ userId: teamMembers.userId, teamId: teamMembers.teamId })
    .from(teamMembers);

  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.image,
    role: profile.role ?? undefined,
    status: (profile.status as UserStatus | null) ?? undefined,
    joinedDate: profile.createdAt
      ? new Date(profile.createdAt).toISOString()
      : undefined,
    teamIds: memberships
      .filter((m) => m.userId === profile.id)
      .map((m) => m.teamId),
  }));
}

export async function getAssigneeCounts(): Promise<Record<string, number>> {
  const db = getDb();

  const assigneeRows = await db
    .select({
      issueId: issueAssignees.issueId,
      userId: issueAssignees.userId,
    })
    .from(issueAssignees);

  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(issues);

  const assignedIssueIds = new Set(assigneeRows.map((row) => row.issueId));

  const counts: Record<string, number> = {
    unassigned: Number(total) - assignedIssueIds.size,
  };

  for (const item of assigneeRows) {
    if (item.userId) {
      counts[item.userId] = (counts[item.userId] || 0) + 1;
    }
  }

  return counts;
}
