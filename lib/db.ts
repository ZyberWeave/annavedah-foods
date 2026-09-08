import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

// Keep module imports safe when the database is intentionally unavailable (for
// example, local storefront development). Callers such as getProducts() can
// then catch the query error and use their bundled fallback data. Routes that
// require persistence still fail with an actionable configuration message.
export const sql = databaseUrl
  ? neon(databaseUrl)
  : (async () => {
      throw new Error(
        'DATABASE_URL is not configured. Copy .env.example to .env.local and set DATABASE_URL.',
      );
    }) as unknown as ReturnType<typeof neon>;

// Initialize Drizzle ORM with the Neon SQL client and our schema
export const db = drizzle(sql, { schema });

const DDL_STATEMENTS = [
  'CREATE SCHEMA IF NOT EXISTS annavedah',
  'ALTER TABLE annavedah.users ADD COLUMN IF NOT EXISTS saved_address JSONB',
  'ALTER TABLE annavedah.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT now()',
  'ALTER TABLE annavedah.users ADD COLUMN IF NOT EXISTS cart_data TEXT',
  'ALTER TABLE annavedah.users ADD COLUMN IF NOT EXISTS avatar_url TEXT',
  'CREATE TABLE IF NOT EXISTS annavedah.otps (id SERIAL PRIMARY KEY, email TEXT NOT NULL, otp TEXT NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT now() NOT NULL)',
  'CREATE TABLE IF NOT EXISTS annavedah.rate_limits (key TEXT NOT NULL, window_start TIMESTAMP NOT NULL, count INTEGER DEFAULT 0 NOT NULL, PRIMARY KEY (key, window_start))',
];

let schemaEnsuredPromise: Promise<void> | null = null;

export async function ensureDbSchema(): Promise<void> {
  if (!databaseUrl) return;
  if (!schemaEnsuredPromise) {
    schemaEnsuredPromise = (async () => {
      for (const stmt of DDL_STATEMENTS) {
        try {
          if (typeof (sql as any).query === 'function') {
            await (sql as any).query(stmt);
          } else if (typeof sql === 'function') {
            await (sql as any)([stmt]);
          }
        } catch {
          // Non-blocking: continue to next statement if one already exists or fails
        }
      }
    })();
  }
  return schemaEnsuredPromise;
}
