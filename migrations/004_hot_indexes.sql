-- Indexes for queries that run on every request path.
-- Idempotent: safe to re-run.

-- /api/orders GET — list orders for a user.
CREATE INDEX IF NOT EXISTS orders_user_id_idx
  ON orders (user_id);

-- /api/auth/register + /api/auth/reset-password OTP lookup by email + expiry.
CREATE INDEX IF NOT EXISTS otps_email_expires_idx
  ON otps (email, expires_at);

-- Public product reviews fetched by slug + status='approved' on product pages.
CREATE INDEX IF NOT EXISTS product_reviews_slug_status_idx
  ON product_reviews (product_slug, status);

-- Refund history lookups per user.
CREATE INDEX IF NOT EXISTS refund_requests_user_id_idx
  ON refund_requests (user_id);

-- Helpful-vote dedupe joins.
CREATE INDEX IF NOT EXISTS review_helpful_votes_user_id_idx
  ON review_helpful_votes (user_id);
