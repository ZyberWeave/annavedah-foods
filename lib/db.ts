import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

// Keep module imports safe when the database is intentionally unavailable (for
// example, local storefront development). Callers such as getProducts() can
// then catch the query error and use their bundled fallback data. Routes that
// require persistence still fail with an actionable configuration message.
const sql = databaseUrl
  ? neon(databaseUrl)
  : (async () => {
      throw new Error(
        'DATABASE_URL is not configured. Copy .env.example to .env.local and set DATABASE_URL.',
      );
    }) as unknown as ReturnType<typeof neon>;

// Initialize Drizzle ORM with the Neon SQL client and our schema
export const db = drizzle(sql, { schema });
