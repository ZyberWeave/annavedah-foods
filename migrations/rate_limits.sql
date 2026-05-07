-- Run this once against your Neon database to enable Postgres-backed rate limiting.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TIMESTAMP NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx
  ON rate_limits (window_start);

-- Optional periodic cleanup (run on a cron / scheduled task):
--   DELETE FROM rate_limits WHERE window_start < now() - interval '1 day';

-- Review helpful-vote dedupe table.
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);
