import { pgSchema, serial, bigserial, bigint, text, timestamp, varchar, integer, boolean, decimal, primaryKey, date, jsonb, numeric, index } from 'drizzle-orm/pg-core';
import type { SavedAddress } from './saved-address';

// Keep every Annavedah table in its own PostgreSQL namespace. Roots & Reefs
// may intentionally use the same Neon project, but it must never share rows,
// constraints, sequences, or admin accounts with this application.
const pgTable = pgSchema('annavedah').table;

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  nameHindi: text('name_hindi').notNull(),
  localName: text('local_name').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  price: integer('price').default(0).notNull(),
  originalPrice: integer('original_price').default(0).notNull(),
  costPrice: integer('cost_price').default(0).notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  benefits: text('benefits').notNull(), // stored as JSON string
  usage: text('usage').notNull(),
  highlights: text('highlights').notNull(), // stored as JSON string
  packPrices: text('pack_prices').notNull(), // stored as JSON string
  badge: text('badge'),
  stock: integer('stock').default(50).notNull(),
  active: boolean('active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  text: text('text').notNull(),
  rating: integer('rating').default(5).notNull(),
  active: boolean('active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const instagramReels = pgTable('instagram_reels', {
  id: serial('id').primaryKey(),
  permalink: text('permalink').notNull(),
  caption: text('caption'),
  displayOrder: integer('display_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  avatarUrl: text('avatar_url'),
  cartData: text('cart_data'), // JSON string of saved cart
  savedAddress: jsonb('saved_address').$type<SavedAddress>(),
  // Bumped on every password change. JWTs minted before this timestamp are
  // rejected by verifySession() so a stolen cookie loses validity the moment
  // the user resets their password.
  passwordChangedAt: timestamp('password_changed_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refundRequests = pgTable('refund_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  orderId: text('order_id').notNull(),
  reason: text('reason').notNull(),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, approved, rejected
  // Idempotency for the Razorpay refund call. Filled in BEFORE the gateway
  // call (with a sentinel) and replaced with the real refund id on success.
  // If non-null, no gateway re-call is allowed for this row.
  razorpayRefundId: text('razorpay_refund_id'),
  inventoryToken: text('inventory_token').unique(),
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
  // Default 'pending' so a row that's inserted without an explicit status is
  // not auto-promoted to success. Authoritative writes (Razorpay verify,
  // shiprocket COD) set this explicitly.
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  items: text('items').notNull(), // JSON string of items
  // Set when the Shiprocket order has been created — used as an idempotency
  // gate so a re-POST to /api/shiprocket/create-order does not produce a
  // duplicate fulfillment side effect.
  shippingId: text('shipping_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviewHelpfulVotes = pgTable('review_helpful_votes', {
  reviewId: integer('review_id').notNull(),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.reviewId, t.userId] }),
}));

export const rateLimits = pgTable('rate_limits', {
  key: text('key').notNull(),
  windowStart: timestamp('window_start').notNull(),
  count: integer('count').default(0).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.key, t.windowStart] }),
}));

export const productReviews = pgTable('product_reviews', {
  id: serial('id').primaryKey(),
  productSlug: text('product_slug').notNull(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  location: text('location').default('').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, approved, rejected
  helpful: integer('helpful').default(0).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posBatches = pgTable('annavedah_pos_batches', {
  batchId: text('batch_id').primaryKey(), productId: text('product_id').notNull(),
  productName: text('product_name').notNull(), productSlug: text('product_slug'),
  mfdDate: date('mfd_date').notNull(), expiryDate: date('expiry_date').notNull(),
  barcode: text('barcode').notNull().unique(), initialStock: integer('initial_stock').notNull(),
  currentStock: integer('current_stock').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }),
  location: text('location'), supplier: text('supplier'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  productIdx: index('annavedah_pos_batches_product_idx').on(table.productId),
  expiryIdx: index('annavedah_pos_batches_expiry_idx').on(table.expiryDate),
}));

export const posOrders = pgTable('annavedah_pos_orders', {
  invoiceNo: text('invoice_no').primaryKey(), customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  gstAmount: numeric('gst_amount', { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 10 }).notNull(),
  items: jsonb('items').notNull(), createdBy: text('created_by').notNull(),
  shiftId: bigint('shift_id', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ createdIdx: index('annavedah_pos_orders_created_idx').on(table.createdAt) }));

export const posShifts = pgTable('annavedah_pos_shifts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  businessDate: date('business_date').notNull(),
  status: varchar('status', { length: 10 }).default('open').notNull(),
  openedBy: text('opened_by').notNull(),
  openingFloat: numeric('opening_float', { precision: 12, scale: 2 }).notNull(),
  totalSales: numeric('total_sales', { precision: 14, scale: 2 }).default('0').notNull(),
  cashSales: numeric('cash_sales', { precision: 14, scale: 2 }).default('0').notNull(),
  upiSales: numeric('upi_sales', { precision: 14, scale: 2 }).default('0').notNull(),
  cardSales: numeric('card_sales', { precision: 14, scale: 2 }).default('0').notNull(),
  orderCount: integer('order_count').default(0).notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }).defaultNow().notNull(),
  closedBy: text('closed_by'),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closingCash: numeric('closing_cash', { precision: 12, scale: 2 }),
  expectedCash: numeric('expected_cash', { precision: 12, scale: 2 }),
  cashDifference: numeric('cash_difference', { precision: 12, scale: 2 }),
  notes: text('notes'),
});
