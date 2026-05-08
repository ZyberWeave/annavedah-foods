-- Idempotency column for /api/shiprocket/create-order.
-- Set after a successful Shiprocket call; subsequent calls short-circuit.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_id TEXT;
