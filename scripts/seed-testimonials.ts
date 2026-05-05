import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('Seeding testimonials...');

  await sql`INSERT INTO testimonials (name, location, text, rating, display_order, active) VALUES ('Priya Sharma', 'Mumbai', 'The quality is consistent and my family enjoys adding these products to everyday meals.', 5, 0, true)`;
  console.log('  ✓ Added: Priya Sharma');

  await sql`INSERT INTO testimonials (name, location, text, rating, display_order, active) VALUES ('Rahul Desai', 'Pune', 'Great range of traditional staples and powders in practical pack sizes.', 5, 1, true)`;
  console.log('  ✓ Added: Rahul Desai');

  await sql`INSERT INTO testimonials (name, location, text, rating, display_order, active) VALUES ('Anita Kulkarni', 'Bengaluru', 'Simple ordering experience and dependable pantry products for weekly use.', 5, 2, true)`;
  console.log('  ✓ Added: Anita Kulkarni');

  console.log('Done! Seeded 3 testimonials.');
}

seed().catch(console.error);
