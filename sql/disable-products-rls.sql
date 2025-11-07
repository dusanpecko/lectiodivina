-- Disable RLS for products table (products are public anyway)
-- This is simpler than managing policies for public data

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Verify products are now accessible
SELECT id, name->>'sk' as name_sk, slug, is_active, price, stock, category 
FROM products 
WHERE is_active = true;
