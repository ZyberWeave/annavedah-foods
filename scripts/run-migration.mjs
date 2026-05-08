import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

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

/**
 * Statement-aware Postgres SQL splitter. Splits on `;` only when the parser
 * is in normal "code" state — not inside:
 *   - line comments  -- ... \n
 *   - block comments /* ... *\/
 *   - single-quoted strings 'text', with '' as an escaped quote
 *   - double-quoted identifiers "Foo bar"
 *   - dollar-quoted blocks  $$ ... $$  or  $tag$ ... $tag$
 *
 * This is enough for our hand-written migrations; it does not try to be a
 * full SQL lexer.
 */
function splitStatements(text) {
  const stmts = [];
  let buf = '';
  let i = 0;
  let mode = 'code'; // 'code' | 'line' | 'block' | 'sq' | 'dq' | 'dollar'
  let dollarTag = ''; // when mode='dollar', the closing tag (e.g. '$$' or '$foo$')

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (mode === 'code') {
      // Line comment opener
      if (ch === '-' && next === '-') {
        mode = 'line';
        buf += '--';
        i += 2;
        continue;
      }
      // Block comment opener
      if (ch === '/' && next === '*') {
        mode = 'block';
        buf += '/*';
        i += 2;
        continue;
      }
      // Single-quoted string
      if (ch === "'") {
        mode = 'sq';
        buf += ch;
        i += 1;
        continue;
      }
      // Double-quoted identifier
      if (ch === '"') {
        mode = 'dq';
        buf += ch;
        i += 1;
        continue;
      }
      // Dollar-quoted block — match $$ or $tag$
      if (ch === '$') {
        const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(text.slice(i));
        if (m) {
          mode = 'dollar';
          dollarTag = m[0];
          buf += dollarTag;
          i += dollarTag.length;
          continue;
        }
      }
      if (ch === ';') {
        stmts.push(buf);
        buf = '';
        i += 1;
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    if (mode === 'line') {
      buf += ch;
      i += 1;
      if (ch === '\n') mode = 'code';
      continue;
    }

    if (mode === 'block') {
      if (ch === '*' && next === '/') {
        buf += '*/';
        i += 2;
        mode = 'code';
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }

    if (mode === 'sq') {
      if (ch === "'" && next === "'") {
        buf += "''";
        i += 2;
        continue;
      }
      buf += ch;
      i += 1;
      if (ch === "'") mode = 'code';
      continue;
    }

    if (mode === 'dq') {
      if (ch === '"' && next === '"') {
        buf += '""';
        i += 2;
        continue;
      }
      buf += ch;
      i += 1;
      if (ch === '"') mode = 'code';
      continue;
    }

    if (mode === 'dollar') {
      if (text.startsWith(dollarTag, i)) {
        buf += dollarTag;
        i += dollarTag.length;
        mode = 'code';
        dollarTag = '';
        continue;
      }
      buf += ch;
      i += 1;
      continue;
    }
  }
  if (buf.trim()) stmts.push(buf);

  return stmts
    .map((s) => s.trim())
    .filter(
      (s) =>
        s &&
        !s
          .split('\n')
          .every((line) => line.trim().startsWith('--') || line.trim() === ''),
    );
}

const statements = splitStatements(sqlText);
const sql = neon(process.env.DATABASE_URL);

for (const stmt of statements) {
  const firstLine = stmt.split('\n').find((l) => l.trim() && !l.trim().startsWith('--')) ?? stmt.split('\n')[0];
  console.log('> ' + firstLine.slice(0, 80) + (firstLine.length > 80 ? '...' : ''));
  await sql.query(stmt);
}
console.log('Migration complete.');
