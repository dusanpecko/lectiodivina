-- Fix Users Admin Access
-- Add RLS policy for admins to see all users

-- Drop existing admin policy if exists
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Add admin policy - admins can see all users
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Verify current policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;