import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews } from '@/lib/schema';
import { eq, sql } from 'drizzle-orm';

// POST — increment helpful count for a review
export async function POST(request: NextRequest) {
  try {
    const { reviewId } = await request.json();
    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await db
      .update(productReviews)
      .set({ helpful: sql`${productReviews.helpful} + 1` })
      .where(eq(productReviews.id, reviewId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating helpful count:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
