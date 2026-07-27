CREATE TABLE IF NOT EXISTS annavedah.annavedah_pos_shifts (
  id bigserial PRIMARY KEY,
  business_date date NOT NULL DEFAULT CURRENT_DATE,
  status varchar(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_by text NOT NULL,
  opening_float numeric(12,2) NOT NULL CHECK (opening_float >= 0),
  total_sales numeric(14,2) NOT NULL DEFAULT 0,
  cash_sales numeric(14,2) NOT NULL DEFAULT 0,
  upi_sales numeric(14,2) NOT NULL DEFAULT 0,
  card_sales numeric(14,2) NOT NULL DEFAULT 0,
  order_count integer NOT NULL DEFAULT 0,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_by text,
  closed_at timestamptz,
  closing_cash numeric(12,2),
  expected_cash numeric(12,2),
  cash_difference numeric(12,2),
  notes text
);
ALTER TABLE annavedah.annavedah_pos_shifts ADD COLUMN IF NOT EXISTS total_sales numeric(14,2) NOT NULL DEFAULT 0;
ALTER TABLE annavedah.annavedah_pos_shifts ADD COLUMN IF NOT EXISTS cash_sales numeric(14,2) NOT NULL DEFAULT 0;
ALTER TABLE annavedah.annavedah_pos_shifts ADD COLUMN IF NOT EXISTS upi_sales numeric(14,2) NOT NULL DEFAULT 0;
ALTER TABLE annavedah.annavedah_pos_shifts ADD COLUMN IF NOT EXISTS card_sales numeric(14,2) NOT NULL DEFAULT 0;
ALTER TABLE annavedah.annavedah_pos_shifts ADD COLUMN IF NOT EXISTS order_count integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS annavedah_pos_one_open_shift_idx
  ON annavedah.annavedah_pos_shifts ((status)) WHERE status = 'open';
ALTER TABLE annavedah.annavedah_pos_orders
  ADD COLUMN IF NOT EXISTS shift_id bigint REFERENCES annavedah.annavedah_pos_shifts(id);
CREATE INDEX IF NOT EXISTS annavedah_pos_orders_shift_idx
  ON annavedah.annavedah_pos_orders(shift_id, created_at DESC);
