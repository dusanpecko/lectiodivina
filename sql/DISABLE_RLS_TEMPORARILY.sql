-- ⚠️ TEMPORARY: Disable RLS to test if that's the issue
-- This is NOT safe for production, only for debugging!

ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE donations DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE with proper policies:
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
