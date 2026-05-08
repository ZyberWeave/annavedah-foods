import { and, eq, isNull, notInArray } from 'drizzle-orm';

import { db } from './db';
import { abandonedCarts, orders } from './schema';
import { PAID_ORDER_STATUSES } from './order-status';

export async function findOrderByOrderId(orderId: string) {
  const [row] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
  return row ?? null;
}

/**
 * Strict ownership: ONLY userId match counts. The previous email fallback
 * was unsafe because users can change their account email at any time and
 * inherit any guest order with that customerEmail. To still cover the
 * legitimate "guest checkout then later signup" case, claimGuestOrders()
 * stamps all matching null-userId rows at registration time.
 *
 * The third arg is kept for callsite compat but is unused.
 */
export function userOwnsOrder(
  order: { userId: number | null; customerEmail: string },
  session: { userId: number },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _sessionEmail: string | null,
): boolean {
  return order.userId != null && order.userId === session.userId;
}

/**
 * Stamp orders that were placed as guests (userId IS NULL) with a real
 * userId when the matching account is created. Called from /api/auth/register
 * once the user row is inserted.
 */
export async function claimGuestOrders(userId: number, email: string) {
  // Match case-insensitively because orders.customer_email may have been
  // written in different casings before normalization rolled out.
  const normalized = email.trim().toLowerCase();
  await db
    .update(orders)
    .set({ userId })
    .where(and(isNull(orders.userId), eq(orders.customerEmail, normalized)));
}

export type PersistedOrderItem = {
  name: string;
  qty: number;
  price: number;
};

export async function persistOrderRecord({
  orderId,
  paymentId,
  customerEmail,
  total,
  items,
  status = 'success',
  userId,
}: {
  orderId: string;
  paymentId?: string | null;
  customerEmail: string;
  total: number;
  items: PersistedOrderItem[];
  status?: string;
  userId?: number | null;
}) {
  // Every callsite now passes an authoritative userId from a verified session.
  // The previous email-fallback lookup was unsafe (users can change their
  // account email at any time) and is no longer needed.
  const resolvedUserId = userId ?? null;
  const normalizedTotal = Number.isFinite(Number(total)) ? Math.round(Number(total)) : 0;

  // Guard against downgrade: once an order has reached any "paid" state
  // (success, processing, shipped, delivered) this helper must never
  // overwrite it. Authoritative forward transitions go through dedicated
  // routes (the Razorpay verify direct UPDATE, the admin orders PATCH) and
  // bypass this helper entirely.
  const [savedOrder] = await db
    .insert(orders)
    .values({
      orderId,
      paymentId: paymentId ?? null,
      userId: resolvedUserId,
      customerEmail,
      total: normalizedTotal,
      items: JSON.stringify(items),
      status,
    })
    .onConflictDoUpdate({
      target: orders.orderId,
      set: {
        paymentId: paymentId ?? null,
        userId: resolvedUserId,
        customerEmail,
        total: normalizedTotal,
        items: JSON.stringify(items),
        status,
      },
      where: notInArray(orders.status, [...PAID_ORDER_STATUSES]),
    })
    .returning();

  await db
    .update(abandonedCarts)
    .set({ status: 'recovered' })
    .where(and(eq(abandonedCarts.email, customerEmail), eq(abandonedCarts.status, 'pending')));

  return savedOrder;
}
