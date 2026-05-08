-- Email canonicalization rollout.
--
-- Step 1 (DETECT): refuse to lowercase if doing so would create a duplicate.
--   If you see an exception below, run the helper SELECT manually to find
--   the colliding pairs, merge them by hand, and re-run this script:
--
--       SELECT lower(trim(email)) AS canonical, count(*), array_agg(id)
--       FROM users
--       GROUP BY lower(trim(email))
--       HAVING count(*) > 1;
--
-- Step 2 (NORMALIZE): lowercase + trim every users.email and orders.customer_email.
-- Step 3 (CONSTRAIN): add a unique index on lower(email) so any future bug
--   that re-introduces mixed case is caught at the DB layer.

DO $$
DECLARE
  collisions INT;
BEGIN
  SELECT count(*) INTO collisions FROM (
    SELECT lower(trim(email)) AS canonical
    FROM users
    GROUP BY lower(trim(email))
    HAVING count(*) > 1
  ) sub;
  IF collisions > 0 THEN
    RAISE EXCEPTION
      '% case-only-different email collision(s) in users — merge accounts manually before re-running.',
      collisions;
  END IF;
END $$;

UPDATE users
   SET email = lower(trim(email))
 WHERE email <> lower(trim(email));

UPDATE orders
   SET customer_email = lower(trim(customer_email))
 WHERE customer_email <> lower(trim(customer_email));

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (lower(email));
