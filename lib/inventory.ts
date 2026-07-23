import { products as staticProducts, type Product } from './content';

export type OrderItem = {
  slug: string;
  qty: number;
};

export type StockDeductionResult = {
  success: boolean;
  deductedItems: { productSlug: string; quantityDeducted: number }[];
};

export type StockRestorationResult = {
  success: boolean;
  restoredItems: { productSlug: string; quantityRestored: number }[];
};

/**
 * Deducts stock for ordered products in Annavedah Foods.
 * If the purchased item is a Gift Box (isGift === true), automatically resolves
 * its `bundleItems` and deducts stock for each underlying bundled product
 * proportional to item.qty * bundleItem.quantity.
 */
export function deductInventoryForOrder(items: OrderItem[]): StockDeductionResult {
  const deductedItems: { productSlug: string; quantityDeducted: number }[] = [];

  for (const orderItem of items) {
    const product = staticProducts.find((p) => p.slug === orderItem.slug);

    if (product?.isGift && product.bundleItems && product.bundleItems.length > 0) {
      // Gift Box purchased: loop through each bundled product
      for (const bundle of product.bundleItems) {
        const qtyToDeduct = orderItem.qty * bundle.quantity;
        deductedItems.push({
          productSlug: bundle.productSlug,
          quantityDeducted: qtyToDeduct,
        });
        console.log(`[Annavedah Inventory] Deducted ${qtyToDeduct}x of bundled product '${bundle.productSlug}' for Gift Box '${product.name}'`);
      }
    } else if (product) {
      // Standard product
      deductedItems.push({
        productSlug: product.slug,
        quantityDeducted: orderItem.qty,
      });
      console.log(`[Annavedah Inventory] Deducted ${orderItem.qty}x of product '${product.slug}'`);
    }
  }

  return {
    success: true,
    deductedItems,
  };
}

/**
 * Restores/increments stock when an order or item is refunded in Annavedah Foods.
 * If the refunded item is a Gift Box (isGift === true), automatically unpacks
 * its `bundleItems` and restores stock for each underlying bundled product
 * proportional to item.qty * bundleItem.quantity.
 */
export function restoreInventoryForRefund(items: OrderItem[]): StockRestorationResult {
  const restoredItems: { productSlug: string; quantityRestored: number }[] = [];

  for (const orderItem of items) {
    const product = staticProducts.find((p) => p.slug === orderItem.slug);

    if (product?.isGift && product.bundleItems && product.bundleItems.length > 0) {
      // Gift Box refunded: restore stock for each bundled product
      for (const bundle of product.bundleItems) {
        const qtyToRestore = orderItem.qty * bundle.quantity;
        restoredItems.push({
          productSlug: bundle.productSlug,
          quantityRestored: qtyToRestore,
        });
        console.log(`[Annavedah Inventory Restoration] Restored ${qtyToRestore}x of bundled product '${bundle.productSlug}' for refunded Gift Box '${product.name}'`);
      }
    } else if (product) {
      // Standard product refunded
      restoredItems.push({
        productSlug: product.slug,
        quantityRestored: orderItem.qty,
      });
      console.log(`[Annavedah Inventory Restoration] Restored ${orderItem.qty}x of product '${product.slug}'`);
    }
  }

  return {
    success: true,
    restoredItems,
  };
}
