import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create a connection to the Neon Database using the connection string from environment variables
// It's safe to use non-null assertion since we expect this to be set in production/local config.
const sql = neon(process.env.DATABASE_URL!);

// Initialize Drizzle ORM with the Neon SQL client and our schema
export const db = drizzle(sql, { schema });
