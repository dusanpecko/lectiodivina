-- ============================================
-- ZAPNUTIE RLS PRE VŠETKY KRITICKÉ TABUĽKY
-- ============================================
-- Dátum: 24. november 2025
-- Účel: Finálne zapnutie Row Level Security s optimalizovanými politikami
-- 
-- PRED SPUSTENÍM:
-- 1. Zálohujte databázu
-- 2. Testujte na staging prostredí
-- 3. Overte, že máte admin prístup
--
-- PO SPUSTENÍ:
-- 1. Testujte CRUD operácie na každej tabuľke
-- 2. Overte Stripe webhooks (donations, subscriptions, orders)
-- 3. Zmazať DISABLE_RLS_TEMPORARILY.sql
-- ============================================

-- ============================================
-- KROK 1: ZAPNÚŤ RLS NA VŠETKÝCH TABUĽKÁCH
-- ============================================

-- Už máte zapnuté (podľa exportu):
-- ✅ donations
-- ✅ subscriptions  
-- ✅ orders
-- ✅ users

-- Zapneme na ďalších dôležitých tabuľkách (len tie, ktoré existujú):
DO $$
BEGIN
  -- Products
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'products') THEN
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Order items
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'order_items') THEN
    ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Notification preferences
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_notification_preferences') THEN
    ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- FCM tokens
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_fcm_tokens') THEN
    ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Notification topics
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'notification_topics') THEN
    ALTER TABLE notification_topics ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Notification logs
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'notification_logs') THEN
    ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Scheduled notifications
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'scheduled_notifications') THEN
    ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Articles
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'articles') THEN
    ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Lectio sources
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'lectio_sources') THEN
    ALTER TABLE lectio_sources ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Beta feedback
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'beta_feedback') THEN
    ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Error reports
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'error_reports') THEN
    ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- KROK 2: PRODUCTS - E-SHOP (len ak tabuľka existuje)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'products') THEN
    RAISE NOTICE 'Table products does not exist, skipping...';
    RETURN;
  END IF;
END $$;

-- Drop staré politiky
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can view all products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Service role full access (pre backend API)
CREATE POLICY "service_role_all_products"
ON products FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public môže vidieť aktívne produkty
CREATE POLICY "public_view_active_products"
ON products FOR SELECT
TO public
USING (is_active = true);

-- Authenticated users môžu vidieť aktívne produkty
CREATE POLICY "authenticated_view_active_products"
ON products FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins môžu všetko
CREATE POLICY "admins_manage_products"
ON products FOR ALL
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

-- ============================================
-- KROK 3: ORDER_ITEMS
-- ============================================

DROP POLICY IF EXISTS "service_role_all_order_items" ON order_items;
DROP POLICY IF EXISTS "users_read_own_order_items" ON order_items;

-- Service role full access (webhooks)
CREATE POLICY "service_role_all_order_items"
ON order_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users môžu vidieť svoje order items
CREATE POLICY "users_read_own_order_items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')
  )
);

-- Admins môžu všetko
CREATE POLICY "admins_manage_order_items"
ON order_items FOR ALL
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

-- ============================================
-- KROK 4: USER_NOTIFICATION_PREFERENCES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "service_role_all_preferences" ON user_notification_preferences;

-- Service role full access
CREATE POLICY "service_role_all_preferences"
ON user_notification_preferences FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users môžu spravovať svoje preferences
CREATE POLICY "users_manage_own_preferences"
ON user_notification_preferences FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins môžu vidieť všetky
CREATE POLICY "admins_view_all_preferences"
ON user_notification_preferences FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- KROK 5: USER_FCM_TOKENS
-- ============================================

DROP POLICY IF EXISTS "Users can manage their own tokens" ON user_fcm_tokens;
DROP POLICY IF EXISTS "service_role_all_tokens" ON user_fcm_tokens;

-- Service role full access (pre FCM API)
CREATE POLICY "service_role_all_tokens"
ON user_fcm_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users môžu spravovať svoje tokeny
CREATE POLICY "users_manage_own_tokens"
ON user_fcm_tokens FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- KROK 6: NOTIFICATION_TOPICS (READ-ONLY pre users)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active topics" ON notification_topics;
DROP POLICY IF EXISTS "service_role_all_topics" ON notification_topics;
DROP POLICY IF EXISTS "admins_manage_topics" ON notification_topics;

-- Service role full access
CREATE POLICY "service_role_all_topics"
ON notification_topics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public môže vidieť aktívne témy
CREATE POLICY "public_view_active_topics"
ON notification_topics FOR SELECT
TO public
USING (is_active = true);

-- Authenticated users môžu vidieť aktívne témy
CREATE POLICY "authenticated_view_active_topics"
ON notification_topics FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins môžu všetko
CREATE POLICY "admins_manage_topics"
ON notification_topics FOR ALL
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

-- ============================================
-- KROK 7: NOTIFICATION_LOGS (ADMIN ONLY)
-- ============================================

DROP POLICY IF EXISTS "service_role_all_logs" ON notification_logs;
DROP POLICY IF EXISTS "admins_view_logs" ON notification_logs;

-- Service role full access
CREATE POLICY "service_role_all_logs"
ON notification_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins môžu vidieť logy
CREATE POLICY "admins_view_logs"
ON notification_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================
-- KROK 8: SCHEDULED_NOTIFICATIONS (ADMIN ONLY)
-- ============================================

DROP POLICY IF EXISTS "service_role_all_scheduled" ON scheduled_notifications;
DROP POLICY IF EXISTS "admins_manage_scheduled" ON scheduled_notifications;

-- Service role full access (pre cron jobs)
CREATE POLICY "service_role_all_scheduled"
ON scheduled_notifications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins môžu spravovať scheduled notifications
CREATE POLICY "admins_manage_scheduled"
ON scheduled_notifications FOR ALL
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

-- ============================================
-- KROK 9: ARTICLES (PUBLIC READ, ADMIN WRITE)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
DROP POLICY IF EXISTS "service_role_all_articles" ON articles;
DROP POLICY IF EXISTS "admins_manage_articles" ON articles;

-- Service role full access
CREATE POLICY "service_role_all_articles"
ON articles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public môže vidieť publikované články
CREATE POLICY "public_view_published_articles"
ON articles FOR SELECT
TO public
USING (status = 'published');

-- Authenticated users môžu vidieť publikované články
CREATE POLICY "authenticated_view_published_articles"
ON articles FOR SELECT
TO authenticated
USING (status = 'published');

-- Admins môžu všetko
CREATE POLICY "admins_manage_articles"
ON articles FOR ALL
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

-- ============================================
-- KROK 10: LECTIO_SOURCES (PUBLIC READ, ADMIN WRITE)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view lectio sources" ON lectio_sources;
DROP POLICY IF EXISTS "service_role_all_lectio" ON lectio_sources;
DROP POLICY IF EXISTS "admins_manage_lectio" ON lectio_sources;

-- Service role full access
CREATE POLICY "service_role_all_lectio"
ON lectio_sources FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public môže vidieť lectio sources
CREATE POLICY "public_view_lectio"
ON lectio_sources FOR SELECT
TO public
USING (true);

-- Admins môžu všetko
CREATE POLICY "admins_manage_lectio"
ON lectio_sources FOR ALL
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

-- ============================================
-- KROK 11: ROSARY_MYSTERIES (PRESKOČENÉ - tabuľka neexistuje)
-- ============================================
-- Tabuľka rosary_mysteries neexistuje v databáze

-- ============================================
-- KROK 12: BIBLE_VERSES (PRESKOČENÉ - tabuľka neexistuje)  
-- ============================================
-- Tabuľka bible_verses neexistuje v databáze

-- ============================================
-- KROK 13: BETA_FEEDBACK (ANONYMOUS SUBMISSIONS)
-- ============================================
-- Poznámka: beta_feedback nemá user_id, len email (anonymous submissions)

DROP POLICY IF EXISTS "Users can create feedback" ON beta_feedback;
DROP POLICY IF EXISTS "service_role_all_feedback" ON beta_feedback;
DROP POLICY IF EXISTS "admins_view_feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Allow anonymous beta feedback submissions" ON beta_feedback;
DROP POLICY IF EXISTS "Admins can view all beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Admins can update beta feedback" ON beta_feedback;

-- Service role full access
CREATE POLICY "service_role_all_feedback"
ON beta_feedback FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anyone môže vytvárať feedback (anonymous)
CREATE POLICY "anyone_create_feedback"
ON beta_feedback FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users môžu tiež vytvárať feedback
CREATE POLICY "authenticated_create_feedback"
ON beta_feedback FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins môžu všetko
CREATE POLICY "admins_manage_feedback"
ON beta_feedback FOR ALL
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

-- ============================================
-- KROK 14: ERROR_REPORTS (ANONYMOUS SUBMISSIONS)
-- ============================================
-- Poznámka: error_reports nemá user_id, len email (anonymous submissions)

DROP POLICY IF EXISTS "Users can create error reports" ON error_reports;
DROP POLICY IF EXISTS "service_role_all_errors" ON error_reports;
DROP POLICY IF EXISTS "admins_view_errors" ON error_reports;
DROP POLICY IF EXISTS "Anyone can submit error reports" ON error_reports;
DROP POLICY IF EXISTS "Admins can view all error reports" ON error_reports;
DROP POLICY IF EXISTS "Admins can update error reports" ON error_reports;

-- Service role full access
CREATE POLICY "service_role_all_errors"
ON error_reports FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Anyone môže vytvárať error reports (anonymous)
CREATE POLICY "anyone_create_errors"
ON error_reports FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users môžu tiež vytvárať error reports
CREATE POLICY "authenticated_create_errors"
ON error_reports FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins môžu všetko
CREATE POLICY "admins_manage_errors"
ON error_reports FOR ALL
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

-- ============================================
-- KROK 15: OPTIMALIZÁCIA USERS POLITÍK
-- ============================================

-- Už existujúce politiky sú OK, len cleanup duplicitov
DROP POLICY IF EXISTS "Service role has full access to users" ON users;

-- Vytvoríme lepšiu service_role politiku
CREATE POLICY "service_role_full_access_users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- OVERENIE - VÝPIS VŠETKÝCH POLITÍK
-- ============================================

SELECT 
  tablename,
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
  AND tablename IN (
    'users', 'subscriptions', 'donations', 'orders', 'order_items',
    'products', 'user_notification_preferences', 'user_fcm_tokens',
    'notification_topics', 'notification_logs', 'scheduled_notifications',
    'articles', 'lectio_sources', 'beta_feedback', 'error_reports'
  )
ORDER BY tablename, policyname;

-- ============================================
-- OVERENIE RLS STATUSU
-- ============================================

SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN c.relrowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = t.tablename) as policy_count
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'subscriptions', 'donations', 'orders', 'order_items',
    'products', 'user_notification_preferences', 'user_fcm_tokens',
    'notification_topics', 'notification_logs', 'scheduled_notifications',
    'articles', 'lectio_sources', 'beta_feedback', 'error_reports'
  )
ORDER BY tablename;

-- ============================================
-- COMMIT - Ak všetko prebehlo OK
-- ============================================

-- Nezabudnite otestovať pred commitom!
-- COMMIT;
