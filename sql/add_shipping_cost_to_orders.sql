-- Add shipping_cost column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Add shipping_zone column to store the zone name
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_zone TEXT;

-- Add comment
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in EUR';
COMMENT ON COLUMN orders.shipping_zone IS 'Shipping zone name (e.g., zone1, zone2)';

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_orders_shipping_zone ON orders(shipping_zone);
