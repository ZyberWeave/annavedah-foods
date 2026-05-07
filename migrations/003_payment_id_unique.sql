-- Prevent the same Razorpay payment_id from being bound to multiple local
-- order rows. Excludes NULL and the 'COD' sentinel so legacy rows + every
-- COD row remain valid.
--
-- If this fails, you have duplicate paymentId rows already — inspect with:
--   SELECT payment_id, count(*) FROM orders
--   WHERE payment_id IS NOT NULL AND payment_id <> 'COD'
--   GROUP BY payment_id HAVING count(*) > 1;
-- and clean them up before re-running.

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_id_unique
  ON orders (payment_id)
  WHERE payment_id IS NOT NULL AND payment_id <> 'COD';
