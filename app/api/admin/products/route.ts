import { and, eq, ne } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  buildProductInsertValues,
  getAllAdminProducts,
  getNextProductDisplayOrder,
  invalidateProductCache,
  isProductCategory,
  normalizePackPrices,
  normalizeStringList,
  type ProductMutationInput,
} from '@/lib/products';
import { productReviews, products } from '@/lib/schema';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseProductPayload(body: any): { data?: ProductMutationInput; error?: string } {
  const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const category = typeof body?.category === 'string' ? body.category.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const usage = typeof body?.usage === 'string' ? body.usage.trim() : '';
  const image = typeof body?.image === 'string' ? body.image.trim() : '';
  const benefits = normalizeStringList(body?.benefits);
  const highlights = normalizeStringList(body?.highlights);
  const packPrices = normalizePackPrices(body?.packPrices);
  const badge = typeof body?.badge === 'string' ? body.badge.trim() : '';
  const nameHindi = typeof body?.nameHindi === 'string' ? body.nameHindi.trim() : '';
  const localName = typeof body?.localName === 'string' ? body.localName.trim() : '';
  const active = typeof body?.active === 'boolean' ? body.active : true;

  if (!name || !slug || !description || !usage) {
    return { error: 'Name, slug, description, and usage are required.' };
  }

  if (!slugPattern.test(slug)) {
    return { error: 'Slug must use lowercase letters, numbers, and hyphens only.' };
  }

  if (!isProductCategory(category)) {
    return { error: 'Invalid category.' };
  }

  if (benefits.length === 0 || highlights.length === 0) {
    return { error: 'Add at least one benefit and one highlight.' };
  }

  return {
    data: {
      slug,
      name,
      nameHindi,
      localName,
      category,
      image,
      description,
      benefits,
      usage,
      highlights,
      packPrices,
      badge,
      active,
    },
  };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const adminProducts = await getAllAdminProducts();
    return NextResponse.json({ products: adminProducts });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const parsed = parseProductPayload(body);
    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const payload = parsed.data;

    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, payload.slug))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });
    }

    const displayOrder = await getNextProductDisplayOrder();
    const [created] = await db
      .insert(products)
      .values(buildProductInsertValues(payload, { displayOrder }))
      .returning({ id: products.id });

    invalidateProductCache();

    const adminProducts = await getAllAdminProducts();
    const product = adminProducts.find((item) => item.id === created.id);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Admin products create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const id = Number(body?.id);

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const parsed = parseProductPayload(body);
    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const payload = parsed.data;

    const [current] = await db
      .select({ id: products.id, slug: products.slug, displayOrder: products.displayOrder })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!current) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const [slugConflict] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(ne(products.id, id), eq(products.slug, payload.slug)))
      .limit(1);

    if (slugConflict) {
      return NextResponse.json({ error: 'A product with this slug already exists.' }, { status: 409 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set(buildProductInsertValues(payload, { displayOrder: current.displayOrder }))
        .where(eq(products.id, id));

      if (current.slug !== payload.slug) {
        await tx
          .update(productReviews)
          .set({ productSlug: payload.slug })
          .where(eq(productReviews.productSlug, current.slug));
      }
    });

    invalidateProductCache();

    const adminProducts = await getAllAdminProducts();
    const product = adminProducts.find((item) => item.id === id);

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Admin products update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const [current] = await db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!current) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(productReviews).where(eq(productReviews.productSlug, current.slug));
      await tx.delete(products).where(eq(products.id, id));
    });

    invalidateProductCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin products delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
