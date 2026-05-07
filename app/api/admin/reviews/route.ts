import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, desc, sql } from 'drizzle-orm';

// Admin GET — all reviews (with optional status filter)
export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const status = request.nextUrl.searchParams.get('status');

    let query = db.select().from(productReviews).orderBy(desc(productReviews.createdAt)).$dynamic();

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.where(eq(productReviews.status, status));
    }

    const rows = await query;

    // Summary stats
    const statsResult = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${productReviews.status} = 'pending')::int`,
        approved: sql<number>`count(*) filter (where ${productReviews.status} = 'approved')::int`,
        rejected: sql<number>`count(*) filter (where ${productReviews.status} = 'rejected')::int`,
      })
      .from(productReviews);

    return NextResponse.json({ reviews: rows, stats: statsResult[0] });
  } catch (err) {
    console.error('Error fetching admin reviews:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// Admin PUT — update review status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id, status } = await request.json();
    if (!id || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await db
      .update(productReviews)
      .set({ status })
      .where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating review:', err);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

// Admin DELETE — delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    await db.delete(productReviews).where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting review:', err);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
