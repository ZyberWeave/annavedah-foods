-- Per-user "password changed at" stamp. Used by verifySession() to invalidate
-- JWTs minted before the latest password change, so a stolen cookie can't
-- outlive a password reset.
--
-- Backfilled to now() for existing rows (callers can't tell the difference
-- — current sessions will simply re-authenticate next time they hit a
-- protected endpoint, which is acceptable).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NOT NULL DEFAULT now();
