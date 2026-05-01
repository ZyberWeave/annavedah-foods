import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './lib/schema';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(schema.users).values({
    name: 'Admin User',
    email: 'admin@annavedah.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Admin user created: admin@annavedah.com / admin123');
}

main().catch(console.error);
