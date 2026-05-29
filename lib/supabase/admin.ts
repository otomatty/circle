import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

/**
 * Service-role client for scripts and migrations only.
 * Never expose this client to the browser.
 */
export function createSupabaseAdminClient() {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
