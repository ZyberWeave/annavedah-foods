export const GST_RATE = 0.05
export const GST_PERCENT = 5

export function calculateGst(taxableAmount: number): number {
  return Math.round(Math.max(0, taxableAmount) * GST_RATE * 100) / 100
}

export function calculateOrderTotal(taxableAmount: number, gstAmount: number, extraCharges = 0): number {
  return Math.round(Math.max(0, taxableAmount) + gstAmount + Math.max(0, extraCharges))
}
