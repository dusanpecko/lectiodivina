-- Fix RLS policies for spiritual_exercises_registrations
-- Date: 2025-11-30
-- Allow public read access for counting registrations (anonymous users need to see capacity)

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow public read of registration counts" ON spiritual_exercises_registrations;

-- Create new policy for anonymous users to count registrations
CREATE POLICY "Allow public read of registration counts" 
ON spiritual_exercises_registrations 
FOR SELECT 
TO anon
USING (true);

-- Also ensure authenticated users can read
DROP POLICY IF EXISTS "Allow authenticated users to read registrations" ON spiritual_exercises_registrations;

CREATE POLICY "Allow authenticated users to read registrations"
ON spiritual_exercises_registrations
FOR SELECT
TO authenticated
USING (true);
