-- =====================================================
-- RLS Policies pre admina - Liturgický kalendár
-- =====================================================
-- Tento súbor pridáva RLS policies pre INSERT, UPDATE, DELETE
-- pre tabuľky liturgického kalendára pre adminov

-- =====================================================
-- 1. liturgical_years - Admin policies
-- =====================================================

-- Admin môže vkladať nové roky
CREATE POLICY "Admin môže vkladať liturgical_years" 
ON liturgical_years
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin môže aktualizovať roky
CREATE POLICY "Admin môže aktualizovať liturgical_years" 
ON liturgical_years
FOR UPDATE
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

-- Admin môže mazať roky
CREATE POLICY "Admin môže mazať liturgical_years" 
ON liturgical_years
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- 2. liturgical_calendar - Admin policies
-- =====================================================

-- Admin môže vkladať dni
CREATE POLICY "Admin môže vkladať liturgical_calendar" 
ON liturgical_calendar
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin môže aktualizovať dni
CREATE POLICY "Admin môže aktualizovať liturgical_calendar" 
ON liturgical_calendar
FOR UPDATE
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

-- Admin môže mazať dni
CREATE POLICY "Admin môže mazať liturgical_calendar" 
ON liturgical_calendar
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- 3. name_days - Admin policies
-- =====================================================

-- Admin môže vkladať meniny
CREATE POLICY "Admin môže vkladať name_days" 
ON name_days
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Admin môže aktualizovať meniny
CREATE POLICY "Admin môže aktualizovať name_days" 
ON name_days
FOR UPDATE
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

-- Admin môže mazať meniny
CREATE POLICY "Admin môže mazať name_days" 
ON name_days
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- Koniec
-- =====================================================
-- Po spustení tohto SQL v Supabase Query Editor budú admini
-- môcť vytvárať, upravovať a mazať liturgické dáta.
