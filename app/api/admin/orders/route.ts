import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, users } from '@/lib/schema';
import { and, eq, desc } from 'drizzle-orm';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const rows = await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        paymentId: orders.paymentId,
        customerEmail: orders.customerEmail,
        total: orders.total,
        status: orders.status,
        items: orders.items,
        createdAt: orders.createdAt,
        userName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    const shaped = rows.map((r) => {
      let parsedItems: Array<{ name: string; qty: number; price: number }> = [];
      try { parsedItems = JSON.parse(r.items); } catch { parsedItems = []; }
      const itemCount = parsedItems.reduce((s, i) => s + (i.qty || 0), 0);
      const isCod = r.paymentId === 'COD' || (r.paymentId ?? '').startsWith('COD');
      const paymentLabel = !r.paymentId ? 'Pending' : (isCod ? 'COD' : 'Paid');
      return {
        id: r.id,
        orderId: r.orderId,
        customerName: r.userName || r.customerEmail.split('@')[0],
        customerEmail: r.customerEmail,
        total: r.total,
        items: itemCount,
        itemList: parsedItems,
        status: r.status,
        payment: paymentLabel,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ orders: shaped });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Allowed admin-driven transitions. The keys are the CURRENT status; the
 * value array is the set of statuses admin may move the order to. Any
 * transition into a paid-state (success/processing/shipped/delivered) is
 * disallowed unless the row already has a paymentId — admin must not be
 * able to mint revenue or trigger refund eligibility on an unpaid row.
 */
const TRANSITIONS: Record<string, readonly string[]> = {
  pending: ['cancelled'],
  success: ['processing', 'shipped', 'delivered', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
};

const PAID_TARGETS = new Set(['success', 'processing', 'shipped', 'delivered']);

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status required' }, { status: 400 });
    }
    // Admin can never directly mint 'success' — that's reserved for the
    // Razorpay verify / webhook / Shiprocket-COD authoritative paths.
    if (status === 'success') {
      return NextResponse.json({ error: 'Cannot transition to success directly' }, { status: 400 });
    }

    const [existing] = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const allowedNext = TRANSITIONS[existing.status] ?? [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition ${existing.status} → ${status}` },
        { status: 400 },
      );
    }

    // Hard guard against turning an unpaid row into a paid-state row. Only
    // allows paid-state transitions if the existing row already shows real
    // payment evidence (a Razorpay paymentId or the COD sentinel). This
    // closes the previous gap where admin could push pending → shipped on
    // a never-paid Razorpay create-order leftover.
    if (PAID_TARGETS.has(status)) {
      const hasPayment = !!existing.paymentId;
      if (!hasPayment) {
        return NextResponse.json(
          { error: 'Order has no payment recorded; cannot transition to a paid status.' },
          { status: 400 },
        );
      }
    }

    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(and(eq(orders.orderId, orderId), eq(orders.status, existing.status)))
      .returning();
    if (!updated) {
      return NextResponse.json(
        { error: 'Order state changed concurrently. Please refresh.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update admin order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
