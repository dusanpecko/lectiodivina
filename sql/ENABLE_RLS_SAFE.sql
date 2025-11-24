-- ============================================
-- BEZPEČNÉ ZAPNUTIE RLS
-- ============================================
-- Tento skript zapne RLS len na tabuľkách, ktoré REÁLNE existujú
-- Automaticky preskočí neexistujúce tabuľky
-- ============================================

-- ============================================
-- KROK 1: ZAPNÚŤ RLS NA EXISTUJÚCICH TABUĽKÁCH
-- ============================================

DO $$
DECLARE
  table_name TEXT;
  tables_to_check TEXT[] := ARRAY[
    'products',
    'order_items', 
    'user_notification_preferences',
    'user_fcm_tokens',
    'notification_topics',
    'notification_logs',
    'scheduled_notifications',
    'articles',
    'lectio_sources',
    'beta_feedback',
    'error_reports'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE '✅ RLS enabled on: %', table_name;
    ELSE
      RAISE NOTICE '⏭️  Skipping (does not exist): %', table_name;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- KROK 2: VYTVORENIE POLITÍK
-- ============================================

-- --------------------------------------------
-- PRODUCTS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    -- Drop staré
    DROP POLICY IF EXISTS "Anyone can view active products" ON products;
    DROP POLICY IF EXISTS "Admins can manage products" ON products;
    DROP POLICY IF EXISTS "service_role_all_products" ON products;
    DROP POLICY IF EXISTS "public_view_active_products" ON products;
    DROP POLICY IF EXISTS "authenticated_view_active_products" ON products;
    DROP POLICY IF EXISTS "admins_manage_products" ON products;

    -- Service role
    CREATE POLICY "service_role_all_products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    -- Public read active
    CREATE POLICY "public_view_active_products" ON products FOR SELECT TO public USING (is_active = true);
    
    -- Authenticated read active
    CREATE POLICY "authenticated_view_active_products" ON products FOR SELECT TO authenticated USING (is_active = true);
    
    -- Admins all
    CREATE POLICY "admins_manage_products" ON products FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: products';
  END IF;
END $$;

-- --------------------------------------------
-- ORDER_ITEMS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
    DROP POLICY IF EXISTS "service_role_all_order_items" ON order_items;
    DROP POLICY IF EXISTS "users_read_own_order_items" ON order_items;
    DROP POLICY IF EXISTS "admins_manage_order_items" ON order_items;

    CREATE POLICY "service_role_all_order_items" ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "users_read_own_order_items" ON order_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt()->>'email')));
    
    CREATE POLICY "admins_manage_order_items" ON order_items FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: order_items';
  END IF;
END $$;

-- --------------------------------------------
-- USER_NOTIFICATION_PREFERENCES (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_notification_preferences') THEN
    DROP POLICY IF EXISTS "Users can view their own preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "service_role_all_preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "users_manage_own_preferences" ON user_notification_preferences;
    DROP POLICY IF EXISTS "admins_view_all_preferences" ON user_notification_preferences;

    CREATE POLICY "service_role_all_preferences" ON user_notification_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "users_manage_own_preferences" ON user_notification_preferences FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    
    CREATE POLICY "admins_view_all_preferences" ON user_notification_preferences FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: user_notification_preferences';
  END IF;
END $$;

-- --------------------------------------------
-- USER_FCM_TOKENS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_fcm_tokens') THEN
    DROP POLICY IF EXISTS "Users can manage their own tokens" ON user_fcm_tokens;
    DROP POLICY IF EXISTS "service_role_all_tokens" ON user_fcm_tokens;
    DROP POLICY IF EXISTS "users_manage_own_tokens" ON user_fcm_tokens;

    CREATE POLICY "service_role_all_tokens" ON user_fcm_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "users_manage_own_tokens" ON user_fcm_tokens FOR ALL TO authenticated
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    
    RAISE NOTICE '✅ Policies created for: user_fcm_tokens';
  END IF;
END $$;

-- --------------------------------------------
-- NOTIFICATION_TOPICS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_topics') THEN
    DROP POLICY IF EXISTS "Anyone can view active topics" ON notification_topics;
    DROP POLICY IF EXISTS "service_role_all_topics" ON notification_topics;
    DROP POLICY IF EXISTS "admins_manage_topics" ON notification_topics;
    DROP POLICY IF EXISTS "public_view_active_topics" ON notification_topics;
    DROP POLICY IF EXISTS "authenticated_view_active_topics" ON notification_topics;

    CREATE POLICY "service_role_all_topics" ON notification_topics FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "public_view_active_topics" ON notification_topics FOR SELECT TO public USING (is_active = true);
    
    CREATE POLICY "authenticated_view_active_topics" ON notification_topics FOR SELECT TO authenticated USING (is_active = true);
    
    CREATE POLICY "admins_manage_topics" ON notification_topics FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: notification_topics';
  END IF;
END $$;

-- --------------------------------------------
-- NOTIFICATION_LOGS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_logs') THEN
    DROP POLICY IF EXISTS "service_role_all_logs" ON notification_logs;
    DROP POLICY IF EXISTS "admins_view_logs" ON notification_logs;

    CREATE POLICY "service_role_all_logs" ON notification_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "admins_view_logs" ON notification_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: notification_logs';
  END IF;
END $$;

-- --------------------------------------------
-- SCHEDULED_NOTIFICATIONS (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scheduled_notifications') THEN
    DROP POLICY IF EXISTS "service_role_all_scheduled" ON scheduled_notifications;
    DROP POLICY IF EXISTS "admins_manage_scheduled" ON scheduled_notifications;

    CREATE POLICY "service_role_all_scheduled" ON scheduled_notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "admins_manage_scheduled" ON scheduled_notifications FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: scheduled_notifications';
  END IF;
END $$;

-- --------------------------------------------
-- ARTICLES (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
    DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
    DROP POLICY IF EXISTS "service_role_all_articles" ON articles;
    DROP POLICY IF EXISTS "admins_manage_articles" ON articles;
    DROP POLICY IF EXISTS "public_view_published_articles" ON articles;
    DROP POLICY IF EXISTS "authenticated_view_published_articles" ON articles;

    CREATE POLICY "service_role_all_articles" ON articles FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "public_view_published_articles" ON articles FOR SELECT TO public USING (status = 'published');
    
    CREATE POLICY "authenticated_view_published_articles" ON articles FOR SELECT TO authenticated USING (status = 'published');
    
    CREATE POLICY "admins_manage_articles" ON articles FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: articles';
  END IF;
END $$;

-- --------------------------------------------
-- LECTIO_SOURCES (ak existuje)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lectio_sources') THEN
    DROP POLICY IF EXISTS "Anyone can view lectio sources" ON lectio_sources;
    DROP POLICY IF EXISTS "service_role_all_lectio" ON lectio_sources;
    DROP POLICY IF EXISTS "admins_manage_lectio" ON lectio_sources;
    DROP POLICY IF EXISTS "public_view_lectio" ON lectio_sources;

    CREATE POLICY "service_role_all_lectio" ON lectio_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "public_view_lectio" ON lectio_sources FOR SELECT TO public USING (true);
    
    CREATE POLICY "admins_manage_lectio" ON lectio_sources FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: lectio_sources';
  END IF;
END $$;

-- --------------------------------------------
-- BETA_FEEDBACK (ak existuje - anonymous)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'beta_feedback') THEN
    DROP POLICY IF EXISTS "Users can create feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "service_role_all_feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "admins_view_feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "Allow anonymous beta feedback submissions" ON beta_feedback;
    DROP POLICY IF EXISTS "Admins can view all beta feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "Admins can update beta feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "anyone_create_feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "authenticated_create_feedback" ON beta_feedback;
    DROP POLICY IF EXISTS "admins_manage_feedback" ON beta_feedback;

    CREATE POLICY "service_role_all_feedback" ON beta_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "anyone_create_feedback" ON beta_feedback FOR INSERT TO public WITH CHECK (true);
    
    CREATE POLICY "authenticated_create_feedback" ON beta_feedback FOR INSERT TO authenticated WITH CHECK (true);
    
    CREATE POLICY "admins_manage_feedback" ON beta_feedback FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: beta_feedback';
  END IF;
END $$;

-- --------------------------------------------
-- ERROR_REPORTS (ak existuje - anonymous)
-- --------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'error_reports') THEN
    DROP POLICY IF EXISTS "Users can create error reports" ON error_reports;
    DROP POLICY IF EXISTS "service_role_all_errors" ON error_reports;
    DROP POLICY IF EXISTS "admins_view_errors" ON error_reports;
    DROP POLICY IF EXISTS "Anyone can submit error reports" ON error_reports;
    DROP POLICY IF EXISTS "Admins can view all error reports" ON error_reports;
    DROP POLICY IF EXISTS "Admins can update error reports" ON error_reports;
    DROP POLICY IF EXISTS "anyone_create_errors" ON error_reports;
    DROP POLICY IF EXISTS "authenticated_create_errors" ON error_reports;
    DROP POLICY IF EXISTS "admins_manage_errors" ON error_reports;

    CREATE POLICY "service_role_all_errors" ON error_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
    
    CREATE POLICY "anyone_create_errors" ON error_reports FOR INSERT TO public WITH CHECK (true);
    
    CREATE POLICY "authenticated_create_errors" ON error_reports FOR INSERT TO authenticated WITH CHECK (true);
    
    CREATE POLICY "admins_manage_errors" ON error_reports FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
    
    RAISE NOTICE '✅ Policies created for: error_reports';
  END IF;
END $$;

-- --------------------------------------------
-- USERS - cleanup duplicitných politík
-- --------------------------------------------
DO $$
BEGIN
  DROP POLICY IF EXISTS "Service role has full access to users" ON users;
  DROP POLICY IF EXISTS "service_role_full_access_users" ON users;
  
  CREATE POLICY "service_role_full_access_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
  
  RAISE NOTICE '✅ Policies created for: users';
END $$;

-- ============================================
-- OVERENIE - ZOZNAM TABULIEK S RLS
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
-- FINÁLNY REPORT
-- ============================================

DO $$
DECLARE
  total_tables INT;
  tables_with_rls INT;
  tables_with_policies INT;
BEGIN
  SELECT COUNT(*) INTO total_tables
  FROM pg_tables 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE schemaname = 'public' AND c.relrowsecurity = true;
  
  SELECT COUNT(DISTINCT tablename) INTO tables_with_policies
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '================================================';
  RAISE NOTICE '🎉 RLS SETUP COMPLETED!';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Total tables in database: %', total_tables;
  RAISE NOTICE 'Tables with RLS enabled: %', tables_with_rls;
  RAISE NOTICE 'Tables with policies: %', tables_with_policies;
  RAISE NOTICE '================================================';
  RAISE NOTICE '⚠️  NEXT STEPS:';
  RAISE NOTICE '1. Test CRUD operations on each table';
  RAISE NOTICE '2. Test Stripe webhooks (donations, subscriptions, orders)';
  RAISE NOTICE '3. Delete DISABLE_RLS_TEMPORARILY.sql';
  RAISE NOTICE '================================================';
END $$;
