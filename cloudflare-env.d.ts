/**
 * Cloudflare Workers bindings available at runtime via
 * `getCloudflareContext().env`. Regenerate base types with
 * `bunx opennextjs-cloudflare typegen` (or `wrangler types`) after editing
 * `wrangler.jsonc`.
 */
interface CloudflareEnv {
  /** D1 database binding (see `d1_databases` in wrangler.jsonc). */
  DB: D1Database;
  /** Public site URL, e.g. https://circle.example.com */
  NEXT_PUBLIC_SITE_URL?: string;
  /** Better Auth secret (set as a Cloudflare secret in production). */
  BETTER_AUTH_SECRET?: string;
  /** Better Auth base URL override. */
  BETTER_AUTH_URL?: string;
  /** Google OAuth client credentials. */
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}
