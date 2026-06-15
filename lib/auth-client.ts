/**
 * Better Auth browser client. Used by client components to start the Google
 * OAuth flow and to sign out.
 */

'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
