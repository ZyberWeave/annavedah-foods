import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { instagramReels } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

// Atomically swap displayOrder of two reels.
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { aId, bId } = await req.json();
  if (typeof aId !== 'number' || typeof bId !== 'number' || aId === bId) {
    return NextResponse.json({ error: 'aId and bId required' }, { status: 400 });
  }

  try {
    await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(instagramReels)
        .where(sql`${instagramReels.id} IN (${aId}, ${bId})`);

      const a = rows.find((r) => r.id === aId);
      const b = rows.find((r) => r.id === bId);
      if (!a || !b) {
        throw new Error('One or both reels not found');
      }

      // Two-phase swap to avoid any unique-index collision on displayOrder.
      await tx.update(instagramReels).set({ displayOrder: -1 }).where(eq(instagramReels.id, a.id));
      await tx.update(instagramReels).set({ displayOrder: a.displayOrder }).where(eq(instagramReels.id, b.id));
      await tx.update(instagramReels).set({ displayOrder: b.displayOrder }).where(eq(instagramReels.id, a.id));
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reels reorder error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to reorder' }, { status: 500 });
  }
}
