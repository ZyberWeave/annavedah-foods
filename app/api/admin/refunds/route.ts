import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const rows = await db
      .select({
        id: refundRequests.id,
        orderId: refundRequests.orderId,
        reason: refundRequests.reason,
        imageUrl: refundRequests.imageUrl,
        status: refundRequests.status,
        createdAt: refundRequests.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(refundRequests)
      .leftJoin(users, eq(refundRequests.userId, users.id))
      .orderBy(desc(refundRequests.createdAt));

    const refunds = rows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      reason: r.reason,
      imageUrl: r.imageUrl,
      status: r.status,
      createdAt: r.createdAt,
      user: {
        name: r.userName ?? '(deleted user)',
        email: r.userEmail ?? '',
      },
    }));

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error('Fetch refunds error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
