import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { instagramReels } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const reels = await db
      .select()
      .from(instagramReels)
      .where(eq(instagramReels.active, true))
      .orderBy(asc(instagramReels.displayOrder));

    return NextResponse.json({ reels });
  } catch {
    return NextResponse.json({ reels: [] });
  }
}
