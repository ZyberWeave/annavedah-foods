-- One open refund request per order. Two concurrent submissions for the same
-- orderId — both reading "no open refund yet" and inserting — would otherwise
-- both succeed. This partial unique index makes the second one fail at the
-- DB layer.
--
-- The application-level check in /api/refund still runs first (returning a
-- friendly 409); this index is the safety net for the race.
--
-- Step 1 (DETECT): refuse to add the index if production already has rows
-- that would violate it. The error names the orderId so support can resolve
-- the duplicates manually before re-running:
--
--     SELECT order_id, count(*) FROM refund_requests
--     WHERE status IN ('pending','approved')
--     GROUP BY order_id HAVING count(*) > 1;
--
-- Step 2 (CONSTRAIN): partial unique index.

DO $$
DECLARE
  conflicting_orders INT;
BEGIN
  SELECT count(*) INTO conflicting_orders FROM (
    SELECT order_id
    FROM refund_requests
    WHERE status IN ('pending', 'approved')
    GROUP BY order_id
    HAVING count(*) > 1
  ) sub;
  IF conflicting_orders > 0 THEN
    RAISE EXCEPTION
      '% order(s) already have multiple open refund requests — resolve manually before re-running.',
      conflicting_orders;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS refund_requests_open_per_order_idx
  ON refund_requests (order_id)
  WHERE status IN ('pending', 'approved');
