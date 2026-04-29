import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Example Schema: Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'), // Example for storing a Vercel Blob URL
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
