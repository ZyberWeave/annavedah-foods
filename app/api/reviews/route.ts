import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productReviews, orders } from '@/lib/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { verifySession } from '@/lib/auth';

// Public GET — approved reviews for a product
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ reviews: [] });
    }

    const rows = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.productSlug, slug), eq(productReviews.status, 'approved')))
      .orderBy(desc(productReviews.createdAt));

    // Also fetch aggregate stats
    const statsResult = await db
      .select({
        count: sql<number>`count(*)::int`,
        avg: sql<number>`coalesce(round(avg(${productReviews.rating})::numeric, 1), 0)::float`,
        r5: sql<number>`count(*) filter (where ${productReviews.rating} = 5)::int`,
        r4: sql<number>`count(*) filter (where ${productReviews.rating} = 4)::int`,
        r3: sql<number>`count(*) filter (where ${productReviews.rating} = 3)::int`,
        r2: sql<number>`count(*) filter (where ${productReviews.rating} = 2)::int`,
        r1: sql<number>`count(*) filter (where ${productReviews.rating} = 1)::int`,
      })
      .from(productReviews)
      .where(and(eq(productReviews.productSlug, slug), eq(productReviews.status, 'approved')));

    const stats = statsResult[0] ?? { count: 0, avg: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0 };

    return NextResponse.json({ reviews: rows, stats });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ reviews: [], stats: { count: 0, avg: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0 } });
  }
}

// Public POST — submit a new review (requires login)
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to submit a review' }, { status: 401 });
    }

    const body = await request.json();
    const { productSlug, name, location, rating, title, reviewBody } = body;

    // Validation
    if (!productSlug || !name?.trim() || !title?.trim() || !reviewBody?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (reviewBody.trim().length < 20) {
      return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 });
    }

    // Verified badge: requires a successful order belonging to this user that
    // was paid via Razorpay (i.e. paymentId present and not 'COD'). COD is
    // self-declared at checkout time and could be cancelled — don't trust it
    // for social proof.
    let isVerified = false;
    try {
      const userOrders = await db
        .select({ items: orders.items, paymentId: orders.paymentId })
        .from(orders)
        .where(and(eq(orders.userId, session.userId), eq(orders.status, 'success')));

      for (const order of userOrders) {
        if (!order.paymentId || order.paymentId === 'COD') continue;
        try {
          const items = JSON.parse(order.items);
          if (Array.isArray(items) && items.some((item: any) => item?.slug === productSlug)) {
            isVerified = true;
            break;
          }
        } catch {}
      }
    } catch {}

    const [review] = await db.insert(productReviews).values({
      productSlug,
      userId: session.userId,
      name: name.trim(),
      location: (location || '').trim(),
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
      status: 'pending',
      verified: isVerified,
      helpful: 0,
    }).returning();

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
