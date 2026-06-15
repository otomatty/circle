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
  const context = getCloudflareContext();
  if (!context?.env?.DB) {
    throw new Error(
      'Cloudflare D1 binding (DB) is not available. Ensure the DB binding is ' +
        'configured in wrangler.jsonc and that you are running inside a ' +
        'Cloudflare Workers context (or `next dev` with ' +
        'initOpenNextCloudflareForDev()).'
    );
  }
  return drizzle(context.env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
