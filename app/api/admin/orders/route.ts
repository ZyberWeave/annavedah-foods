import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

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
      return {
        id: r.id,
        orderId: r.orderId,
        customerName: r.userName || r.customerEmail.split('@')[0],
        customerEmail: r.customerEmail,
        total: r.total,
        items: itemCount,
        itemList: parsedItems,
        status: r.status,
        payment: isCod ? 'COD' : 'Paid',
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({ orders: shaped });
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status required' }, { status: 400 });
    }
    // 'success' is the initial state set by Razorpay verify; admin can transition to processing → shipped → delivered, or cancel.
    const allowed = ['processing', 'shipped', 'delivered', 'cancelled', 'success'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.orderId, orderId))
      .returning();
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update admin order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
