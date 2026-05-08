/**
 * Single source of truth for "this order has been paid for".
 * `success` is the initial post-payment state; admin fulfillment transitions
 * (processing → shipped → delivered) do NOT erase the fact that the order
 * was paid. `cancelled` and `pending` are explicitly NOT paid.
 *
 * Update this list, not individual queries, when fulfillment states change.
 */
export const PAID_ORDER_STATUSES = ['success', 'processing', 'shipped', 'delivered'] as const;
export type PaidOrderStatus = typeof PAID_ORDER_STATUSES[number];
