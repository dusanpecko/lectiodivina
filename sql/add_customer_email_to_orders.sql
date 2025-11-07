-- Add customer_email column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
