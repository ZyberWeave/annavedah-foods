import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load .env.local first, then fall back to .env
config({ path: '.env.local' });
config({ path: '.env' });

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-migration.mjs <path-to-sql>');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Check .env.local / .env.');
  process.exit(1);
}

const sqlText = readFileSync(resolve(file), 'utf8');
const sql = neon(process.env.DATABASE_URL);

// Split on semicolons that end statements; ignore empty / comment-only chunks.
const statements = sqlText
  .split(/;\s*\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s && !s.split('\n').every((line) => line.trim().startsWith('--') || line.trim() === ''));

for (const stmt of statements) {
  console.log('> ' + stmt.split('\n')[0].slice(0, 80) + (stmt.length > 80 ? '...' : ''));
  await sql.query(stmt);
}
console.log('Migration complete.');
