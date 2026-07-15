import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews, reviewHelpfulVotes } from '@/lib/schema';
import { and, eq, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';
import { rateLimitOr429 } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }

    const block = await rateLimitOr429(`helpful:user:${session.userId}`, 30, 60);
    if (block) return block;

    const { reviewId } = await request.json();
    const id = Number(reviewId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: 'Valid reviewId is required' }, { status: 400 });
    }

    // Only allow votes against a review that actually exists and is public,
    // so callers can't create dangling vote rows for arbitrary ids.
    const [target] = await db
      .select({ id: productReviews.id })
      .from(productReviews)
      .where(and(eq(productReviews.id, id), eq(productReviews.status, 'approved')))
      .limit(1);
    if (!target) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Insert dedupe row; if it already exists (user already voted), short-circuit.
    const inserted = await db
      .insert(reviewHelpfulVotes)
      .values({ reviewId: id, userId: session.userId })
      .onConflictDoNothing()
      .returning({ reviewId: reviewHelpfulVotes.reviewId });

    if (inserted.length === 0) {
      return NextResponse.json({ success: true, alreadyVoted: true });
    }

    await db
      .update(productReviews)
      .set({ helpful: sql`${productReviews.helpful} + 1` })
      .where(eq(productReviews.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating helpful count:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
