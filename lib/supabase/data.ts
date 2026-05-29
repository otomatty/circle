import { createSupabaseServerClient } from './server';

/**
 * Returns a Supabase client scoped to the current user session.
 */
export async function getSupabase() {
  return createSupabaseServerClient();
}
