import { and, eq, gte, sql } from 'drizzle-orm';
import { products as staticProducts } from './content';
import { db } from './db';
import { products } from './schema';
import { neon } from '@neondatabase/serverless';

export type OrderItem = { slug: string; qty: number };
export type InventoryChange = { productSlug: string; quantity: number };
export type StockDeductionResult = {
  success: boolean;
  deductedItems: { productSlug: string; quantityDeducted: number }[];
};
export type StockRestorationResult = {
  success: boolean;
  restoredItems: { productSlug: string; quantityRestored: number }[];
};

function expandItems(items: OrderItem[]): InventoryChange[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    if (!item.slug || !Number.isInteger(item.qty) || item.qty <= 0) continue;
    const product = staticProducts.find((candidate) => candidate.slug === item.slug);
    const lines = product?.isGift && product.bundleItems?.length
      ? product.bundleItems.map((bundle) => ({
          productSlug: bundle.productSlug,
          quantity: item.qty * bundle.quantity,
        }))
      : [{ productSlug: item.slug, quantity: item.qty }];
    for (const line of lines) {
      totals.set(line.productSlug, (totals.get(line.productSlug) ?? 0) + line.quantity);
    }
  }
  return [...totals].map(([productSlug, quantity]) => ({ productSlug, quantity }));
}

export async function deductInventoryForOrder(items: OrderItem[]): Promise<StockDeductionResult> {
  const changes = expandItems(items);
  const completed: InventoryChange[] = [];
  try {
    for (const change of changes) {
      const updated = await db
        .update(products)
        .set({ stock: sql`${products.stock} - ${change.quantity}` })
        .where(and(
          eq(products.slug, change.productSlug),
          gte(products.stock, change.quantity),
        ))
        .returning({ slug: products.slug });
      if (updated.length === 0) {
        await restoreInventoryForRefund(completed.map((line) => ({
          slug: line.productSlug,
          qty: line.quantity,
        })));
        return { success: false, deductedItems: [] };
      }
      completed.push(change);
    }
    return {
      success: true,
      deductedItems: completed.map((line) => ({
        productSlug: line.productSlug,
        quantityDeducted: line.quantity,
      })),
    };
  } catch (error) {
    console.error('[inventory/deduct]', error);
    return { success: false, deductedItems: [] };
  }
}

export async function restoreInventoryForRefund(items: OrderItem[]): Promise<StockRestorationResult> {
  const changes = expandItems(items);
  try {
    for (const change of changes) {
      await db
        .update(products)
        .set({ stock: sql`${products.stock} + ${change.quantity}` })
        .where(eq(products.slug, change.productSlug));
    }
    return {
      success: true,
      restoredItems: changes.map((line) => ({
        productSlug: line.productSlug,
        quantityRestored: line.quantity,
      })),
    };
  } catch (error) {
    console.error('[inventory/restore]', error);
    return { success: false, restoredItems: [] };
  }
}

export async function restoreInventoryForRefundOnce(
  refundId: number,
  items: OrderItem[],
): Promise<StockRestorationResult> {
  const changes = expandItems(items);
  if (changes.length === 0 || !process.env.DATABASE_URL) {
    return { success: false, restoredItems: [] };
  }
  const sqlClient = neon(process.env.DATABASE_URL);
  const token = crypto.randomUUID();
  try {
    const queries = [
      sqlClient`UPDATE annavedah.refund_requests
        SET inventory_token = ${token}
        WHERE id = ${refundId} AND inventory_token IS NULL
        RETURNING id`,
      ...changes.map((change) => sqlClient`WITH guard AS (
          SELECT 1 / COUNT(*) AS ok
          FROM annavedah.products WHERE slug = ${change.productSlug}
        )
        UPDATE annavedah.products
        SET stock = stock + ${change.quantity}
        FROM guard
        WHERE slug = ${change.productSlug}
          AND guard.ok = 1
          AND EXISTS (
            SELECT 1 FROM annavedah.refund_requests
            WHERE id = ${refundId} AND inventory_token = ${token}
          )
        RETURNING slug`),
    ];
    const results = await sqlClient.transaction(queries);
    if (results[0].length === 0) {
      const existing = await sqlClient`SELECT inventory_token
        FROM annavedah.refund_requests WHERE id = ${refundId} LIMIT 1`;
      return { success: Boolean(existing[0]?.inventory_token), restoredItems: [] };
    }
    const allUpdated = results.slice(1).every((result) => result.length === 1);
    return {
      success: allUpdated,
      restoredItems: allUpdated
        ? changes.map((line) => ({
            productSlug: line.productSlug,
            quantityRestored: line.quantity,
          }))
        : [],
    };
  } catch (error) {
    console.error('[inventory/restore-once]', error);
    return { success: false, restoredItems: [] };
  }
}
