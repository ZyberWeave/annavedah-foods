import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

// Public GET — only active testimonials, ordered
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.active, true))
      .orderBy(asc(testimonials.displayOrder));

    return NextResponse.json({ testimonials: rows });
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}
