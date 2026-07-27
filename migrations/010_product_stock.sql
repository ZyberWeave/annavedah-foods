ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 50;

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_stock_nonnegative;

ALTER TABLE products
  ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
