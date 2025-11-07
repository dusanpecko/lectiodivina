-- Fix RLS for products table
-- This allows anyone (even unauthenticated users) to view active products

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view active products" ON products;

-- Create the policy again
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Verify RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Test query (should return products)
SELECT id, name, slug, is_active, price, stock FROM products WHERE is_active = true;
