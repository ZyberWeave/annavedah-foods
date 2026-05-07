import { and, eq } from 'drizzle-orm';

import { db } from './db';
import { abandonedCarts, orders, users } from './schema';

export async function findOrderByOrderId(orderId: string) {
  const [row] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
  return row ?? null;
}

export function userOwnsOrder(
  order: { userId: number | null; customerEmail: string },
  session: { userId: number },
  sessionEmail: string | null,
): boolean {
  if (order.userId != null && order.userId === session.userId) return true;
  if (order.userId == null && sessionEmail && order.customerEmail.toLowerCase() === sessionEmail.toLowerCase()) {
    return true;
  }
  return false;
}

export type PersistedOrderItem = {
  name: string;
  qty: number;
  price: number;
};

export async function findOrderUserId(customerEmail: string, preferredUserId?: number | null) {
  if (preferredUserId) return preferredUserId;

  const userRecords = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, customerEmail))
    .limit(1);

  return userRecords[0]?.id ?? null;
}

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
  const resolvedUserId = await findOrderUserId(customerEmail, userId);
  const normalizedTotal = Number.isFinite(Number(total)) ? Math.round(Number(total)) : 0;

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
    })
    .returning();

  await db
    .update(abandonedCarts)
    .set({ status: 'recovered' })
    .where(and(eq(abandonedCarts.email, customerEmail), eq(abandonedCarts.status, 'pending')));

  return savedOrder;
}
