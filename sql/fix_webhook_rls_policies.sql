-- Fix RLS policies for Stripe webhook operations
-- Webhooks use SUPABASE_SERVICE_ROLE_KEY, so we need service_role policies

-- ============================================
-- DONATIONS TABLE
-- ============================================
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "authenticated_read_donations" ON public.donations;
DROP POLICY IF EXISTS "service_role_all_donations" ON public.donations;

-- Enable RLS (if not already enabled)
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (webhooks use service_role key)
CREATE POLICY "service_role_all_donations"
ON public.donations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own donations
CREATE POLICY "users_read_own_donations"
ON public.donations
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_anonymous = true);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "authenticated_read_subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "service_role_all_subscriptions" ON public.subscriptions;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (webhooks use service_role key)
CREATE POLICY "service_role_all_subscriptions"
ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own subscriptions
CREATE POLICY "users_read_own_subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- ORDERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (webhooks use service_role key)
CREATE POLICY "service_role_all_orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to view their own orders
CREATE POLICY "users_read_own_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR customer_email = auth.jwt()->>'email');

-- Allow admins to manage all orders
CREATE POLICY "admins_manage_orders"
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (webhooks need to create order items)
CREATE POLICY "service_role_all_order_items"
ON public.order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to view their own order items
CREATE POLICY "users_read_own_order_items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
  )
);

-- ============================================
-- VERIFICATION
-- ============================================
-- View all policies for these tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('donations', 'subscriptions', 'orders', 'order_items')
ORDER BY tablename, policyname;
