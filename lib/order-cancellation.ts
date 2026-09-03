export const CANCELLATION_REASON_PREFIX = '[ORDER_CANCELLATION]'

export function isCancellationReason(reason: string): boolean {
  return reason.startsWith(CANCELLATION_REASON_PREFIX)
}
