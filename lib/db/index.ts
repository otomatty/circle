/**
 * Drizzle client bound to the Cloudflare D1 database.
 *
 * The D1 binding is only available within a request context, so the client is
 * created lazily on each call rather than at module load. `getCloudflareContext`
 * is populated in local dev via `initOpenNextCloudflareForDev()` (next.config.mjs)
 * and at runtime by the Workers runtime.
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';

import { schema } from './schema';

export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
