/**
 * drizzle-kit configuration.
 *
 * `db:push` is the documented first step for somebody who has just unzipped
 * this and pointed it at an empty database — it creates every table in one
 * command with nothing to read or understand. `db:generate` writes a migration
 * into ./drizzle, which is what a deployment that already has customer data in
 * it should use, so that a renamed column is never guessed at as a drop plus an
 * add.
 *
 * The url falls back to an empty string on purpose: drizzle-kit is a dev tool
 * and must not make the project fail to typecheck on a machine with no
 * database configured yet.
 */

import { existsSync, readFileSync } from 'node:fs';
import type { Config } from 'drizzle-kit';

/**
 * Load the same env files Next.js does.
 *
 * drizzle-kit runs as its own process and never sees the `.env.local` that
 * `next dev` picks up automatically. Without this, the documented flow —
 * copy .env.example, then `npm run db:push` — fails with an empty-url error
 * that gives no hint as to why. Variables already in the environment win, so
 * `DATABASE_URL=... npm run db:push` still overrides the file.
 */
function loadEnvFiles(files: string[]): void {
  for (const file of files) {
    if (!existsSync(file)) continue;
    for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (process.env[key] !== undefined) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadEnvFiles(['.env.local', '.env']);

export default {
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
