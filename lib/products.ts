import { asc, sql } from 'drizzle-orm';
import { revalidateTag, unstable_cache } from 'next/cache';

import { db } from './db';
import {
  products as staticProducts,
  type AdminPackPrice,
  type Product,
  type ProductWithCosts,
  type ProductCategory,
} from './content';
import { products as productsTable } from './schema';

export const PRODUCT_CACHE_TAG = 'products';
export const PRODUCT_CATEGORY_VALUES: ProductCategory[] = [
  'Powders',
  'Grains',
  'Pulses',
  'Atta',
  'Essentials',
  'Papad',
  'Chutney',
  'Gift Boxes & Bundles',
];

const PUBLICLY_RETIRED_CATEGORIES = new Set<ProductCategory>(['Atta', 'Papad', 'Chutney']);
const PUBLICLY_RETIRED_SLUGS = new Set(['gahu-chik-powder']);

function isPubliclyListedProduct(product: Pick<Product, 'slug' | 'category'>) {
  if (PUBLICLY_RETIRED_CATEGORIES.has(product.category)) return false;
  if (PUBLICLY_RETIRED_SLUGS.has(product.slug)) return false;

  return !(
    product.slug.startsWith('mix-dried-vegetables-') ||
    product.slug.startsWith('mixed-dried-vegetables-')
  );
}

type ProductRow = typeof productsTable.$inferSelect;

export type AdminProduct = ProductWithCosts & {
  active: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductMutationInput = {
  slug: string;
  name: string;
  nameHindi?: string;
  localName?: string;
  category: ProductCategory;
  image?: string;
  description: string;
  benefits: string[];
  usage: string;
  highlights: string[];
  packPrices: AdminPackPrice[];
  badge?: string | null;
  active?: boolean;
  displayOrder?: number;
};

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORY_VALUES.includes(value as ProductCategory);
}

export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function normalizePackPrices(value: unknown): AdminPackPrice[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const size = typeof item?.size === 'string' ? item.size.trim() : '';
      const price = Number(item?.price ?? 0);
      const buyPrice = Number(item?.buyPrice ?? 0);

      if (!size || Number.isNaN(price) || Number.isNaN(buyPrice)) return null;

      return {
        size,
        price: Math.max(0, Math.round(price)),
        buyPrice: Math.max(0, Math.round(buyPrice)),
      } satisfies AdminPackPrice;
    })
    .filter((item): item is AdminPackPrice => item !== null);
}

export function deriveProductPricing(packPrices: AdminPackPrice[]) {
  const basePrice = packPrices[0]?.price ?? 0;
  const baseCostPrice = packPrices[0]?.buyPrice ?? 0;
  const originalPrice = packPrices.length > 1 ? packPrices[packPrices.length - 1].price : basePrice;

  return {
    price: basePrice,
    originalPrice,
    costPrice: baseCostPrice,
  };
}

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapRowToProductWithCosts(row: ProductRow): ProductWithCosts {
  const packPrices = normalizePackPrices(parseJsonArray(row.packPrices, []));
  const benefits = normalizeStringList(parseJsonArray(row.benefits, []));
  const highlights = normalizeStringList(parseJsonArray(row.highlights, []));
  const pricing = deriveProductPricing(packPrices);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameHindi: row.nameHindi || row.name,
    localName: row.localName || row.name,
    category: isProductCategory(row.category) ? row.category : 'Essentials',
    price: row.price ?? pricing.price,
    originalPrice: row.originalPrice ?? pricing.originalPrice,
    costPrice: row.costPrice ?? pricing.costPrice,
    image: row.image || '/placeholder.jpg',
    description: row.description,
    benefits,
    usage: row.usage,
    highlights,
    packPrices,
    badge: row.badge ?? undefined,
  };
}

/**
 * Strip procurement cost fields (`costPrice`, and `buyPrice` on every pack)
 * from a product before it can reach the browser. The public product catalog
 * is serialized into the RSC/HTML payload for every visitor (see the root
 * layout → ProductsProvider), so anything left on these objects is readable
 * by anyone via View Source / DevTools. Only the admin path
 * (getAllAdminProducts, behind requireAdmin) is allowed to carry cost data.
 */
function toPublicProduct(product: ProductWithCosts): Product {
  const { costPrice: _costPrice, packPrices, ...publicProduct } = product;

  const sanitizedProduct: Product = {
    ...publicProduct,
    packPrices: packPrices.map(({ size, price }) => ({ size, price })),
  };

  if (sanitizedProduct.slug === 'unpolished-indrayani-rice') {
    return { ...sanitizedProduct, name: 'Semi-Polished Indrayani Rice' };
  }

  return sanitizedProduct;
}

function mapRowToAdminProduct(row: ProductRow): AdminProduct {
  return {
    ...mapRowToProductWithCosts(row),
    active: row.active,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function buildProductInsertValues(
  input: ProductMutationInput,
  overrides: Partial<typeof productsTable.$inferInsert> = {},
): typeof productsTable.$inferInsert {
  const name = input.name.trim();
  const packPrices = normalizePackPrices(input.packPrices);
  const benefits = normalizeStringList(input.benefits);
  const highlights = normalizeStringList(input.highlights);
  const pricing = deriveProductPricing(packPrices);

  return {
    ...overrides,
    slug: input.slug.trim(),
    name,
    nameHindi: input.nameHindi?.trim() || name,
    localName: input.localName?.trim() || name,
    category: input.category,
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    costPrice: pricing.costPrice,
    image: input.image?.trim() || '/placeholder.jpg',
    description: input.description.trim(),
    benefits: JSON.stringify(benefits),
    usage: input.usage.trim(),
    highlights: JSON.stringify(highlights),
    packPrices: JSON.stringify(packPrices),
    badge: input.badge?.trim() || null,
    active: input.active ?? true,
    displayOrder: input.displayOrder ?? 0,
    updatedAt: new Date(),
  };
}

const getCachedActiveProducts = unstable_cache(
  async () => {
    const rows = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.displayOrder), asc(productsTable.id));

    const databaseProducts = rows
      .filter((row) => row.active)
      .map((row) => toPublicProduct(mapRowToProductWithCosts(row)))
      .filter(isPubliclyListedProduct);
    const databaseSlugs = new Set(rows.map((row) => row.slug));

    // The photographed range is committed with the application so a Vercel
    // environment pointing at an older database cannot silently drop it from
    // the public catalog. Any database record, including an inactive one,
    // suppresses the bundled fallback so the admin Hide control stays durable.
    const missingPhotographedProducts = staticProducts
      .filter(
        (product) =>
          isPubliclyListedProduct(product) &&
          product.image.startsWith('/Products/lifestyle/') &&
          !databaseSlugs.has(product.slug),
      )
      .map(toPublicProduct);

    return [...databaseProducts, ...missingPhotographedProducts];
  },
  ['active-products'],
  { tags: [PRODUCT_CACHE_TAG] },
);

export async function getProducts(): Promise<Product[]> {
  try {
    return await getCachedActiveProducts();
  } catch (error) {
    console.error('Load products error:', error);
    // The static fallback also carries buyPrice/costPrice, so it must be
    // sanitized before being served, same as the DB path.
    return staticProducts.filter(isPubliclyListedProduct).map(toPublicProduct);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const rows = await getProducts();
  return rows.find((product) => product.slug === slug) ?? null;
}

export async function getAllAdminProducts(): Promise<AdminProduct[]> {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.displayOrder), asc(productsTable.id));

  return rows.map(mapRowToAdminProduct);
}

export async function getNextProductDisplayOrder() {
  const [row] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${productsTable.displayOrder}), -1)`,
    })
    .from(productsTable);

  return Number(row?.maxOrder ?? -1) + 1;
}

export async function syncProductIdSequence() {
  await db.execute(sql`
    select setval(
      pg_get_serial_sequence('products', 'id'),
      coalesce((select max(id) from products), 0) + 1,
      false
    )
  `);
}

export async function seedCurrentProducts() {
  for (const [index, product] of staticProducts.entries()) {
    const values = buildProductInsertValues(
      {
        slug: product.slug,
        name: product.name,
        nameHindi: product.nameHindi,
        localName: product.localName,
        category: product.category,
        image: product.image,
        description: product.description,
        benefits: product.benefits,
        usage: product.usage,
        highlights: product.highlights,
        packPrices: product.packPrices,
        badge: product.badge,
        active: true,
        displayOrder: index,
      },
      {
        id: product.id,
        displayOrder: index,
        active: true,
      },
    );

    const { id: _id, createdAt: _createdAt, ...updateValues } = values;

    await db
      .insert(productsTable)
      .values(values)
      .onConflictDoUpdate({
        target: productsTable.id,
        set: {
          ...updateValues,
          updatedAt: new Date(),
        },
      });
  }

  await syncProductIdSequence();

  return staticProducts.length;
}

export function invalidateProductCache() {
  revalidateTag(PRODUCT_CACHE_TAG, 'max');
}
