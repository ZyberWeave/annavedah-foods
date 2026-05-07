import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testimonials } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, asc } from 'drizzle-orm';

// GET all testimonials (admin view — includes inactive)
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const rows = await db
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.displayOrder));

  return NextResponse.json({ testimonials: rows });
}

// POST — add a new testimonial
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { name, location, text, rating } = body;

  if (!name || !location || !text) {
    return NextResponse.json({ error: 'Name, location, and text are required' }, { status: 400 });
  }

  // Get max display order
  const existing = await db.select().from(testimonials).orderBy(asc(testimonials.displayOrder));
  const maxOrder = existing.length > 0 ? Math.max(...existing.map(r => r.displayOrder)) + 1 : 0;

  const [testimonial] = await db
    .insert(testimonials)
    .values({
      name,
      location,
      text,
      rating: rating || 5,
      displayOrder: maxOrder,
    })
    .returning();

  return NextResponse.json({ testimonial });
}

// PATCH — update a testimonial (toggle active, reorder, edit)
export async function PATCH(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json();
  const { id, active, displayOrder, name, location, text, rating } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (typeof active === 'boolean') updateData.active = active;
  if (typeof displayOrder === 'number') updateData.displayOrder = displayOrder;
  if (name) updateData.name = name;
  if (location) updateData.location = location;
  if (text) updateData.text = text;
  if (typeof rating === 'number') updateData.rating = rating;

  const [updated] = await db
    .update(testimonials)
    .set(updateData)
    .where(eq(testimonials.id, id))
    .returning();

  return NextResponse.json({ testimonial: updated });
}

// DELETE — remove a testimonial
export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  await db.delete(testimonials).where(eq(testimonials.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
