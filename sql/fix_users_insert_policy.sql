-- Fix Users INSERT Policy
-- Povoliť INSERT pre nových používateľov pri registrácii

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow users insert on registration" ON users;

-- Create policy: Každý môže vytvoriť svoj vlastný záznam pri registrácii
CREATE POLICY "Allow users insert on registration"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
