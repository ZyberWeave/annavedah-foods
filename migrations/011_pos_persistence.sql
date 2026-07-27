CREATE TABLE IF NOT EXISTS annavedah_pos_batches (
  batch_id text PRIMARY KEY, product_id text NOT NULL, product_name text NOT NULL,
  product_slug text, mfd_date date NOT NULL, expiry_date date NOT NULL,
  barcode text NOT NULL UNIQUE, initial_stock integer NOT NULL CHECK (initial_stock >= 0),
  current_stock integer NOT NULL CHECK (current_stock >= 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  cost_price numeric(12,2) CHECK (cost_price >= 0), location text, supplier text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expiry_date >= mfd_date)
);
CREATE INDEX IF NOT EXISTS annavedah_pos_batches_product_idx ON annavedah_pos_batches(product_id);
CREATE INDEX IF NOT EXISTS annavedah_pos_batches_expiry_idx ON annavedah_pos_batches(expiry_date);
CREATE TABLE IF NOT EXISTS annavedah_pos_orders (
  invoice_no text PRIMARY KEY, customer_name text NOT NULL, customer_phone text NOT NULL DEFAULT '',
  subtotal numeric(12,2) NOT NULL, gst_amount numeric(12,2) NOT NULL,
  discount_amount numeric(12,2) NOT NULL, total numeric(12,2) NOT NULL,
  payment_method varchar(10) NOT NULL CHECK (payment_method IN ('CASH','UPI','CARD')),
  items jsonb NOT NULL CHECK (jsonb_typeof(items) = 'array'), created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS annavedah_pos_orders_created_idx ON annavedah_pos_orders(created_at DESC);
