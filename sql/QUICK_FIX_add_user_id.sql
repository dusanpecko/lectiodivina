-- QUICK FIX: Add user_id column to spiritual_exercises_registrations
-- Copy and paste this into Supabase SQL Editor and run it

-- Step 1: Add user_id column
ALTER TABLE spiritual_exercises_registrations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Create index
CREATE INDEX IF NOT EXISTS idx_registrations_user_id 
ON spiritual_exercises_registrations(user_id);

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Allow public registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Users can view their own registrations" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON spiritual_exercises_registrations;
DROP POLICY IF EXISTS "Enable read access for all users" ON spiritual_exercises_registrations;

-- Step 4: Disable RLS temporarily (if needed for testing)
-- ALTER TABLE spiritual_exercises_registrations DISABLE ROW LEVEL SECURITY;

-- Step 5: Create new policies
-- Allow anyone to insert registrations
CREATE POLICY "Enable insert for all users"
ON spiritual_exercises_registrations
FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to view their own registrations
CREATE POLICY "Enable select for authenticated users"
ON spiritual_exercises_registrations
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  auth.role() = 'authenticated'
);

-- Allow service_role to do anything (for admin/backend operations)
CREATE POLICY "Enable all for service role"
ON spiritual_exercises_registrations
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Step 6: Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'spiritual_exercises_registrations' 
AND column_name = 'user_id';

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'spiritual_exercises_registrations';
