import { pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  avatarUrl: text('avatar_url'),
  cartData: text('cart_data'), // JSON string of saved cart
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refundRequests = pgTable('refund_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  orderId: text('order_id').notNull(),
  reason: text('reason').notNull(),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, approved, rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const abandonedCarts = pgTable('abandoned_carts', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  phone: text('phone'),
  cartItems: text('cart_items').notNull(), // stored as JSON string
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, recovered
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  remindedAt: timestamp('reminded_at'),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull().unique(), // Razorpay order id or COD_123
  paymentId: text('payment_id'),
  userId: integer('user_id').references(() => users.id),
  customerEmail: text('customer_email').notNull(),
  total: integer('total').notNull(),
  status: varchar('status', { length: 50 }).default('success').notNull(),
  items: text('items').notNull(), // JSON string of items
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
