import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { refundRequests, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const session = await verifySession();
  
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const refunds = await db
      .select({
        id: refundRequests.id,
        orderId: refundRequests.orderId,
        reason: refundRequests.reason,
        imageUrl: refundRequests.imageUrl,
        status: refundRequests.status,
        createdAt: refundRequests.createdAt,
        user: {
          name: users.name,
          email: users.email,
        }
      })
      .from(refundRequests)
      .innerJoin(users, eq(refundRequests.userId, users.id))
      .orderBy(desc(refundRequests.createdAt));

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error('Fetch refunds error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
