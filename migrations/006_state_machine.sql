-- 1. Idempotency column for the Razorpay refund gateway call.
ALTER TABLE refund_requests
  ADD COLUMN IF NOT EXISTS razorpay_refund_id TEXT;

-- 2. Tighten the orders.status default. Existing rows keep whatever they have;
-- new rows that arrive without an explicit status will default to 'pending'.
ALTER TABLE orders
  ALTER COLUMN status SET DEFAULT 'pending';
