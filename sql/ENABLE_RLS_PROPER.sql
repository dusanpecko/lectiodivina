-- PROPER RLS SETUP for spiritual_exercises_registrations
-- This ensures GDPR compliance and proper access control

-- Step 1: Re-enable RLS
ALTER TABLE spiritual_exercises_registrations ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable insert for all users" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Enable all for service role" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Allow public registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Anyone can create registration" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Users can update own registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Admins can update all registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Users can delete own registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Admins can delete all registrations" ON spiritual_exercises_registrations;

-- Step 3: Create secure policies

-- 3.1 Allow anyone (authenticated or anonymous) to INSERT registrations
-- This is needed because guests can register without account
-- Using anon and authenticated roles to cover all cases
CREATE POLICY "Anyone can create registration"
ON spiritual_exercises_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3.2 Allow users to SELECT only their OWN registrations (GDPR compliant)
-- Authenticated users can see registrations where user_id matches their auth.uid()
CREATE POLICY "Users can view own registrations"
ON spiritual_exercises_registrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3.3 Allow admins to SELECT all registrations (for management)
-- Only users with role 'admin' or 'service_role' can see everything
CREATE POLICY "Admins can view all registrations"
ON spiritual_exercises_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin')
  )
);

-- 3.4 Allow users to UPDATE only their own registrations
CREATE POLICY "Users can update own registrations"
ON spiritual_exercises_registrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.5 Allow admins to UPDATE any registration
CREATE POLICY "Admins can update all registrations"
ON spiritual_exercises_registrations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin')
  )
);

-- 3.6 Allow users to DELETE only their own registrations (GDPR right to be forgotten)
CREATE POLICY "Users can delete own registrations"
ON spiritual_exercises_registrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3.7 Allow admins to DELETE any registration
CREATE POLICY "Admins can delete all registrations"
ON spiritual_exercises_registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin')
  )
);

-- Step 4: Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'spiritual_exercises_registrations'
ORDER BY policyname;

-- Step 5: Test that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'spiritual_exercises_registrations';
