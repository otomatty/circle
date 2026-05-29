'use server';

import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import { createSupabaseServerClient } from '~/lib/supabase/server';

export async function signInWithGoogle(returnPath?: string) {
  const supabase = await createSupabaseServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const nextPath = returnPath?.startsWith('/') ? returnPath : '/';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}${pathsConfig.auth.callback}?next=${encodeURIComponent(nextPath)}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }

  throw new Error('Failed to start Google sign-in');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(pathsConfig.auth.signIn);
}
