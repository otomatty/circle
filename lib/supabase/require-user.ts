import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import pathsConfig from '~/config/paths.config';

import { createSupabaseServerClient } from './server';

export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getOptionalUser();
  if (!user) {
    redirect(pathsConfig.auth.signIn);
  }
  return user;
}
