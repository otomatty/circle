/**
 * Server-side auth helpers (replaces lib/supabase/require-user.ts and
 * lib/supabase/profile.ts). Reads the Better Auth session and maps the
 * authenticated user to the application `User` type.
 */

import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import type { User } from '~/types/users';

import { getAuth } from './auth';
import { getDb } from './db';
import { teamMembers, user as userTable } from './db/schema';

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  status?: string | null;
  createdAt?: Date;
};

async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(pathsConfig.auth.signIn);
  }
  return user;
}

/**
 * Team ids the current user belongs to. Used to scope queries by membership
 * now that D1 has no row-level security. Returns an empty array when there is
 * no authenticated user.
 */
export async function getCurrentUserTeamIds(): Promise<string[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, sessionUser.id));

  return rows.map((row) => row.teamId);
}

export async function getCurrentProfile(): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return null;
  }

  const db = getDb();
  const memberships = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, sessionUser.id));

  return {
    id: sessionUser.id,
    name: sessionUser.name,
    email: sessionUser.email,
    avatarUrl: sessionUser.image ?? null,
    role: sessionUser.role ?? undefined,
    status: (sessionUser.status as User['status']) ?? undefined,
    joinedDate: sessionUser.createdAt
      ? new Date(sessionUser.createdAt).toISOString()
      : undefined,
    teamIds: memberships.map((m) => m.teamId),
  };
}

export async function updateCurrentProfile(input: {
  name?: string;
  status?: User['status'];
}): Promise<User> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error('認証されていません');
  }

  const db = getDb();
  await db
    .update(userTable)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, sessionUser.id));

  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error('プロフィールの更新に失敗しました');
  }
  return profile;
}
