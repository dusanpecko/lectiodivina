-- Fix RLS policies for subscriptions and donations
-- These policies allow users to view only their own data

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON subscriptions;

-- Simple policy: users can view their own subscriptions
CREATE POLICY "Enable read access for authenticated users"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role to insert (for webhooks)
CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to update (for webhooks)
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- DONATIONS
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;
DROP POLICY IF EXISTS "Service role can insert donations" ON donations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON donations;

-- Simple policy: users can view their own donations
CREATE POLICY "Enable read access for authenticated users"
  ON donations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role to insert (for webhooks)
CREATE POLICY "Service role can insert donations"
  ON donations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
