-- ============================================
-- OPRAVA RLS PRE COMMUNITY_MEMBERS
-- ============================================
-- Táto tabuľka nebola v pôvodnom RLS skripte
-- Pridávame politiky pre admin DELETE operácie
-- ============================================

-- Zapnúť RLS (ak ešte nie je)
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Drop staré politiky (ak existujú)
DROP POLICY IF EXISTS "service_role_all_community" ON community_members;
DROP POLICY IF EXISTS "public_insert_community" ON community_members;
DROP POLICY IF EXISTS "authenticated_insert_community" ON community_members;
DROP POLICY IF EXISTS "admins_manage_community" ON community_members;

-- Service role full access
CREATE POLICY "service_role_all_community"
ON community_members FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public môže INSERT (registrácia do komunity)
CREATE POLICY "public_insert_community"
ON community_members FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users môžu INSERT
CREATE POLICY "authenticated_insert_community"
ON community_members FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins môžu všetko (SELECT, UPDATE, DELETE)
CREATE POLICY "admins_manage_community"
ON community_members FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Overenie
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'community_members'
ORDER BY policyname;
