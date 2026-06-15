/**
 * Better Auth configuration (Cloudflare-native).
 *
 * Replaces Supabase Auth. Uses the Drizzle adapter backed by Cloudflare D1 and
 * Google as the social provider. The instance is created per request because
 * the D1 binding and secrets are only available inside a request context.
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

import { schema, teamMembers, teams } from './db/schema';

/**
 * Default team new users are added to on first sign-in (mirrors the old
 * Supabase `handle_new_user` trigger).
 */
const DEFAULT_TEAM_ID = 'CORE';

function getEnv() {
  const context = getCloudflareContext();
  if (!context?.env) {
    throw new Error(
      'Cloudflare environment context is not available. Ensure you are running ' +
        'inside a Cloudflare Workers context (or `next dev` with ' +
        'initOpenNextCloudflareForDev()).'
    );
  }
  return context.env;
}

export function getAuth() {
  const env = getEnv();
  const db = drizzle(env.DB, { schema });

  const baseURL =
    env.BETTER_AUTH_URL ??
    env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000';

  return betterAuth({
    baseURL,
    secret:
      env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? undefined,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    socialProviders: {
      google: {
        clientId:
          env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret:
          env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '',
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'メンバー',
          input: false,
        },
        status: {
          type: 'string',
          required: false,
          defaultValue: 'オンライン',
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (createdUser) => {
            // Add the new user to the default team if it exists.
            const team = await db
              .select({ id: teams.id })
              .from(teams)
              .where(eq(teams.id, DEFAULT_TEAM_ID))
              .limit(1);

            if (team.length > 0) {
              await db
                .insert(teamMembers)
                .values({
                  teamId: DEFAULT_TEAM_ID,
                  userId: createdUser.id,
                  role: 'メンバー',
                })
                .onConflictDoNothing();
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;
