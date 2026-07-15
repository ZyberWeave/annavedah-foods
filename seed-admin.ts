import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './lib/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * Never hardcode admin credentials. This script refuses to run unless a strong
 * password is supplied via ADMIN_SEED_PASSWORD, and it will not overwrite an
 * existing account. Provide:
 *   ADMIN_SEED_EMAIL=you@example.com
 *   ADMIN_SEED_PASSWORD=<>=12 chars, upper+lower+digit>
 *   ADMIN_SEED_NAME="Admin User"   (optional)
 */
function assertStrongPassword(pw: string | undefined): string {
  if (!pw || pw.length < 12 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw)) {
    throw new Error(
      'Refusing to seed: set ADMIN_SEED_PASSWORD to a strong value ' +
      '(at least 12 characters with an uppercase letter, a lowercase letter, and a digit).',
    );
  }
  return pw;
}

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Refusing to seed: set ADMIN_SEED_EMAIL to a valid email address.');
  }
  const password = assertStrongPassword(process.env.ADMIN_SEED_PASSWORD);

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing.length > 0) {
    console.error(`Aborting: a user with email ${email} already exists. Delete or reset it manually.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(schema.users).values({
    name: process.env.ADMIN_SEED_NAME || 'Admin User',
    email,
    password: hashedPassword,
    role: 'admin',
  });
  console.log(`Admin account created for ${email}.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
