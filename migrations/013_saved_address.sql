-- Store one reusable delivery address per authenticated customer.
ALTER TABLE annavedah.users
  ADD COLUMN IF NOT EXISTS saved_address JSONB;

