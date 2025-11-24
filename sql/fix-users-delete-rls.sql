-- ============================================
-- OPRAVA RLS PRE USERS - ADMIN DELETE
-- ============================================
-- Umožní adminom mazať používateľov
-- ============================================

-- Pridať DELETE politiku pre adminov
DROP POLICY IF EXISTS "admins_delete_users" ON users;

CREATE POLICY "admins_delete_users"
ON users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users AS admin_check
    WHERE admin_check.id = auth.uid()
    AND admin_check.role = 'admin'
  )
);

-- Overiť všetky users politiky
SELECT 
  policyname,
  cmd as operation,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Has USING'
    ELSE '❌ No USING'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Has WITH CHECK'
    ELSE '❌ No WITH CHECK'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY cmd, policyname;
