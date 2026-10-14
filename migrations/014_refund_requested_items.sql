-- Preserve the exact product lines and quantities requested for return/refund.
ALTER TABLE annavedah.refund_requests
  ADD COLUMN IF NOT EXISTS requested_items JSONB;
