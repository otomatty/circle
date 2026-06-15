import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for generating Cloudflare D1 (SQLite) migrations.
 *
 *   bunx drizzle-kit generate   # generate SQL from lib/db/schema.ts
 *
 * Apply migrations to D1 with Wrangler:
 *   bunx wrangler d1 migrations apply circle --local   # local dev
 *   bunx wrangler d1 migrations apply circle --remote   # production
 */
export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
});
