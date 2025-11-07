-- Create shipping_zones table
CREATE TABLE IF NOT EXISTS shipping_zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  countries TEXT[] NOT NULL DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL,
  free_threshold DECIMAL(10,2) NOT NULL,
  delivery_days TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE shipping_zones IS 'Shipping zones configuration';
COMMENT ON COLUMN shipping_zones.id IS 'Zone identifier (e.g., zone1, zone2)';
COMMENT ON COLUMN shipping_zones.name IS 'Zone display name';
COMMENT ON COLUMN shipping_zones.countries IS 'Array of country codes (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN shipping_zones.price IS 'Shipping cost in EUR';
COMMENT ON COLUMN shipping_zones.free_threshold IS 'Order value for free shipping in EUR';
COMMENT ON COLUMN shipping_zones.delivery_days IS 'Estimated delivery time (e.g., "2-4")';
COMMENT ON COLUMN shipping_zones.is_active IS 'Whether this zone is currently active';
COMMENT ON COLUMN shipping_zones.sort_order IS 'Display order in admin';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON shipping_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_sort ON shipping_zones(sort_order);

-- Insert default zones
INSERT INTO shipping_zones (id, name, countries, price, free_threshold, delivery_days, sort_order) VALUES
  ('zone1', 'Slovensko a Česko', ARRAY['SK', 'CZ'], 2.99, 50.00, '2-4', 1),
  ('zone2', 'Stredná Európa', ARRAY['AT', 'HU', 'PL', 'DE'], 5.99, 80.00, '3-6', 2),
  ('zone3', 'Západná a Južná Európa', ARRAY['FR', 'IT', 'ES', 'NL', 'BE', 'GB', 'IE', 'PT', 'GR', 'LU', 'MT', 'CY'], 7.99, 100.00, '4-8', 3),
  ('zone4', 'Východná Európa a Balkán', ARRAY['RO', 'BG', 'HR', 'SI', 'RS', 'BA', 'ME', 'MK', 'AL', 'UA', 'MD', 'BY'], 8.99, 100.00, '5-10', 4),
  ('zone5', 'Severná Európa', ARRAY['SE', 'NO', 'DK', 'FI', 'IS', 'EE', 'LV', 'LT'], 9.99, 120.00, '5-10', 5),
  ('zone6', 'USA a Kanada', ARRAY['US', 'CA'], 14.99, 150.00, '7-14', 6),
  ('zone7', 'Ázijsko-Pacifický región', ARRAY['AU', 'NZ', 'JP', 'KR', 'SG', 'HK', 'TW', 'MY', 'TH', 'PH', 'ID', 'VN'], 19.99, 200.00, '10-20', 7),
  ('zone8', 'Ostatný svet', ARRAY[]::TEXT[], 24.99, 250.00, '14-30', 8)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active zones
CREATE POLICY "Anyone can view active shipping zones"
  ON shipping_zones FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can manage zones (admins will be checked in API)
CREATE POLICY "Authenticated users can manage shipping zones"
  ON shipping_zones FOR ALL
  USING (auth.role() = 'authenticated');
