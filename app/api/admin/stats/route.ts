import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, users, refundRequests } from '@/lib/schema';
import { sql, eq, desc, inArray } from 'drizzle-orm';
import { getProducts } from '@/lib/products';
import { PAID_ORDER_STATUSES } from '@/lib/order-status';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    // Revenue and total order count include only PAID orders. 'pending' rows
    // are abandoned Razorpay create-order leftovers and must NOT count as
    // revenue. 'cancelled' rows are also excluded.
    const [{ totalRevenue, totalOrders }] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        totalOrders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(inArray(orders.status, [...PAID_ORDER_STATUSES]));

    const [{ activeOrders }] = await db
      .select({ activeOrders: sql<number>`COUNT(*)` })
      .from(orders)
      .where(sql`${orders.status} IN ('processing', 'shipped', 'success')`);

    const [{ userCount }] = await db
      .select({ userCount: sql<number>`COUNT(*)` })
      .from(users);

    const [{ pendingRefunds }] = await db
      .select({ pendingRefunds: sql<number>`COUNT(*)` })
      .from(refundRequests)
      .where(eq(refundRequests.status, 'pending'));

    const recentRows = await db
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
      .orderBy(desc(orders.createdAt))
      .limit(5);

    const activeProducts = await getProducts();

    const recentOrders = recentRows.map((r) => {
      let parsed: Array<{ qty: number }> = [];
      try { parsed = JSON.parse(r.items); } catch { parsed = []; }
      const itemCount = parsed.reduce((s, i) => s + (i.qty || 0), 0);
      const isCod = r.paymentId === 'COD' || (r.paymentId ?? '').startsWith('COD');
      // Without a paymentId the row is a not-yet-paid Razorpay create-order
      // leftover. Don't mislabel that as 'Paid'.
      const paymentLabel = !r.paymentId ? 'Pending' : (isCod ? 'COD' : 'Paid');
      return {
        orderId: r.orderId,
        customerName: r.userName || r.customerEmail.split('@')[0],
        customerEmail: r.customerEmail,
        total: r.total,
        items: itemCount,
        status: r.status,
        payment: paymentLabel,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({
      totalRevenue: Number(totalRevenue) || 0,
      totalOrders: Number(totalOrders) || 0,
      activeOrders: Number(activeOrders) || 0,
      userCount: Number(userCount) || 0,
      pendingRefunds: Number(pendingRefunds) || 0,
      productCount: activeProducts.length,
      recentOrders,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
