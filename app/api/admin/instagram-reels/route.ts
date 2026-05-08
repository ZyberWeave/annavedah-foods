import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { instagramReels } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, asc } from 'drizzle-orm';
import { toPositiveInt } from '@/lib/validate-id';

// GET all reels (admin view - includes inactive)
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const reels = await db
    .select()
    .from(instagramReels)
    .orderBy(asc(instagramReels.displayOrder));

  return NextResponse.json({ reels });
}

// POST - add a new reel
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { permalink, caption } = body;

  if (!permalink) {
    return NextResponse.json({ error: 'Permalink is required' }, { status: 400 });
  }

  // Get max display order
  const existing = await db.select().from(instagramReels).orderBy(asc(instagramReels.displayOrder));
  const maxOrder = existing.length > 0 ? Math.max(...existing.map(r => r.displayOrder)) + 1 : 0;

  const [reel] = await db
    .insert(instagramReels)
    .values({
      permalink,
      caption: caption || null,
      displayOrder: maxOrder,
    })
    .returning();

  return NextResponse.json({ reel });
}

// PATCH - update a reel (toggle active, reorder, edit)
export async function PATCH(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { id: rawId, active, displayOrder, permalink, caption } = body;

  const id = toPositiveInt(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (typeof active === 'boolean') updateData.active = active;
  if (typeof displayOrder === 'number') updateData.displayOrder = displayOrder;
  if (permalink) updateData.permalink = permalink;
  if (typeof caption === 'string') updateData.caption = caption || null;

  const [updated] = await db
    .update(instagramReels)
    .set(updateData)
    .where(eq(instagramReels.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
  }

  return NextResponse.json({ reel: updated });
}

// DELETE - remove a reel
export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const id = toPositiveInt(searchParams.get('id'));

  if (!id) {
    return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
  }

  await db.delete(instagramReels).where(eq(instagramReels.id, id));

  return NextResponse.json({ success: true });
}
