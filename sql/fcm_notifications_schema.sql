-- ============================================================================
-- FCM NOTIFICATIONS DATABASE SCHEMA
-- ============================================================================
-- Vytvorené: 2025-01-28
-- Účel: Push notifications systém pre Lectio Divina mobile app
-- ============================================================================

-- ============================================================================
-- 1. USER FCM TOKENS TABLE
-- POZNÁMKA: Táto tabuľka už existuje v tvojej databáze!
-- Tento skript len pridá chybajúci stĺpec locale_code
-- ============================================================================

-- Pridaj locale_code stĺpec ak neexistuje
ALTER TABLE public.user_fcm_tokens 
ADD COLUMN IF NOT EXISTS locale_code TEXT CHECK (locale_code IN ('sk', 'en', 'cz', 'es', 'de'));

-- Vytvor index pre locale_code ak neexistuje
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_locale ON public.user_fcm_tokens(locale_code);

-- Nastav default hodnotu 'sk' pre existujúce záznamy bez locale_code
UPDATE public.user_fcm_tokens 
SET locale_code = 'sk' 
WHERE locale_code IS NULL;

-- RLS policies pre user_fcm_tokens (ak ešte neexistujú)
DO $$
BEGIN
  -- Enable RLS ak ešte nie je
  ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist (to avoid conflicts)
  DROP POLICY IF EXISTS "Users can view their own FCM tokens" ON user_fcm_tokens;
  DROP POLICY IF EXISTS "Users can insert their own FCM tokens" ON user_fcm_tokens;
  DROP POLICY IF EXISTS "Users can update their own FCM tokens" ON user_fcm_tokens;
  DROP POLICY IF EXISTS "Service role has full access to FCM tokens" ON user_fcm_tokens;
  
  -- Create policies
  CREATE POLICY "Users can view their own FCM tokens"
    ON user_fcm_tokens FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own FCM tokens"
    ON user_fcm_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own FCM tokens"
    ON user_fcm_tokens FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Service role has full access to FCM tokens"
    ON user_fcm_tokens FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
    
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Some policies already exist or error occurred: %', SQLERRM;
END $$;

COMMENT ON TABLE user_fcm_tokens IS 'Stores FCM tokens for push notifications';
COMMENT ON COLUMN user_fcm_tokens.token IS 'FCM registration token from Firebase';
COMMENT ON COLUMN user_fcm_tokens.device_type IS 'Type of device: ios, android, or web';
COMMENT ON COLUMN user_fcm_tokens.locale_code IS 'User language preference for notifications';
COMMENT ON COLUMN user_fcm_tokens.is_active IS 'Whether this token is still valid and active';


-- ============================================================================
-- 2. NOTIFICATION TOPICS TABLE
-- Definuje dostupné notification topics (kategórie notifikácií)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_sk TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_cs TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_de TEXT,
  description_sk TEXT,
  description_en TEXT,
  description_cs TEXT,
  description_es TEXT,
  description_de TEXT,
  icon TEXT, -- emoji alebo icon name
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('spiritual', 'educational', 'news', 'reminders', 'special', 'general')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_notification_topics_category ON notification_topics(category);
CREATE INDEX IF NOT EXISTS idx_notification_topics_active ON notification_topics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_topics_order ON notification_topics(display_order);

-- Trigger pre updated_at
CREATE TRIGGER update_notification_topics_updated_at
  BEFORE UPDATE ON notification_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS - všetci môžu čítať aktívne topics
ALTER TABLE notification_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active notification topics"
  ON notification_topics FOR SELECT
  USING (is_active = true);

-- Len admini môžu pridávať/upravovať topics
CREATE POLICY "Only admins can manage notification topics"
  ON notification_topics FOR ALL
  USING (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE notification_topics IS 'Defines available notification topics/categories';
COMMENT ON COLUMN notification_topics.category IS 'Category for grouping: spiritual, educational, news, reminders, special, general';
COMMENT ON COLUMN notification_topics.display_order IS 'Order in which topics appear in the app';


-- ============================================================================
-- 3. USER NOTIFICATION PREFERENCES TABLE
-- Ukladá preferencie používateľov pre jednotlivé notification topics
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES notification_topics(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_topic_id ON user_notification_preferences(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_enabled ON user_notification_preferences(is_enabled) WHERE is_enabled = true;

-- Trigger pre updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON user_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON user_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON user_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role má plný prístup
CREATE POLICY "Service role has full access to notification preferences"
  ON user_notification_preferences FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE user_notification_preferences IS 'User preferences for notification topics';
COMMENT ON COLUMN user_notification_preferences.is_enabled IS 'Whether user wants to receive notifications for this topic';


-- ============================================================================
-- 4. NOTIFICATION LOGS TABLE
-- Loguje odoslané notifikácie pre analytics a debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES notification_topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data sent with notification
  locale_code TEXT,
  tokens_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_topic_id ON notification_logs(topic_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_by ON notification_logs(sent_by);
CREATE INDEX IF NOT EXISTS idx_notification_logs_locale ON notification_logs(locale_code);

-- RLS - len admini a service role môžu vidieť logy
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view notification logs"
  ON notification_logs FOR SELECT
  USING (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can insert notification logs"
  ON notification_logs FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE notification_logs IS 'Logs all sent notifications for analytics';
COMMENT ON COLUMN notification_logs.data IS 'Additional custom data sent with notification (JSON)';


-- ============================================================================
-- 5. INSERT DEFAULT NOTIFICATION TOPICS
-- Pridáme základné notification topics pre aplikáciu
-- ============================================================================

INSERT INTO notification_topics (name_sk, name_en, name_cs, name_es, name_de, icon, category, display_order, description_sk, description_en, description_cs, description_es, description_de) VALUES
('Denné zamyslenia', 'Daily Reflections', 'Denní úvahy', 'Reflexiones diarias', 'Tägliche Überlegungen', '🙏', 'spiritual', 1, 
  'Denné duchovné zamyslenia a inšpirácie', 
  'Daily spiritual reflections and inspirations',
  'Denní duchovní úvahy a inspirace',
  'Reflexiones espirituales diarias e inspiraciones',
  'Tägliche spirituelle Überlegungen und Inspirationen'),

('Biblické výklady', 'Biblical Interpretations', 'Biblické výklady', 'Interpretaciones bíblicas', 'Biblische Auslegungen', '📖', 'educational', 2,
  'Výklady biblických textov a učenie',
  'Biblical text interpretations and teaching',
  'Výklady biblických textů a učení',
  'Interpretaciones de textos bíblicos y enseñanza',
  'Biblische Textinterpretationen und Lehre'),

('Modlitby', 'Prayers', 'Modlitby', 'Oraciones', 'Gebete', '🕊️', 'spiritual', 3,
  'Denne modlitby a duchovné cvičenia',
  'Daily prayers and spiritual exercises',
  'Denní modlitby a duchovní cvičení',
  'Oraciones diarias y ejercicios espirituales',
  'Tägliche Gebete und spirituelle Übungen'),

('Aktuality', 'News', 'Aktuality', 'Noticias', 'Nachrichten', '📰', 'news', 4,
  'Novinky a oznamy o aplikácii',
  'News and announcements about the app',
  'Novinky a oznámení o aplikaci',
  'Noticias y anuncios sobre la aplicación',
  'Neuigkeiten und Ankündigungen über die App'),

('Denné pripomienky', 'Daily Reminders', 'Denní připomínky', 'Recordatorios diarios', 'Tägliche Erinnerungen', '⏰', 'reminders', 5,
  'Pripomienky na modlitbu a zamyslenie',
  'Reminders for prayer and reflection',
  'Připomínky k modlitbě a úvaze',
  'Recordatorios para la oración y reflexión',
  'Erinnerungen zum Gebet und zur Reflexion'),

('Sviatky a slávnosti', 'Feasts and Celebrations', 'Svátky a slavnosti', 'Fiestas y celebraciones', 'Feste und Feiern', '✨', 'special', 6,
  'Pripomienky na cirkevné sviatky',
  'Reminders for church feasts',
  'Připomínky na církevní svátky',
  'Recordatorios para fiestas de la iglesia',
  'Erinnerungen an kirchliche Feste'),

('Liturgický kalendár', 'Liturgical Calendar', 'Liturgický kalendář', 'Calendario litúrgico', 'Liturgischer Kalender', '📅', 'educational', 7,
  'Informácie o liturgickom kalendári',
  'Information about the liturgical calendar',
  'Informace o liturgickém kalendáři',
  'Información sobre el calendario litúrgico',
  'Informationen zum liturgischen Kalender'),

('Katechézy', 'Catechesis', 'Katecheze', 'Catequesis', 'Katechese', '📚', 'educational', 8,
  'Katechetické učenie a formácia',
  'Catechetical teaching and formation',
  'Katechetické učení a formace',
  'Enseñanza catequética y formación',
  'Katechetische Lehre und Bildung')

ON CONFLICT DO NOTHING;


-- ============================================================================
-- 6. HELPFUL QUERIES FOR ADMINS
-- ============================================================================

-- View active FCM tokens count by platform
COMMENT ON TABLE user_fcm_tokens IS 'Query: SELECT device_type, COUNT(*) FROM user_fcm_tokens WHERE is_active = true GROUP BY device_type;';

-- View notification topics with subscriber counts
COMMENT ON TABLE notification_topics IS 'Query: SELECT nt.name_sk, COUNT(unp.id) as subscribers FROM notification_topics nt LEFT JOIN user_notification_preferences unp ON nt.id = unp.topic_id AND unp.is_enabled = true GROUP BY nt.id ORDER BY nt.display_order;';

-- View recent notification statistics
COMMENT ON TABLE notification_logs IS 'Query: SELECT title, tokens_count, success_count, failure_count, sent_at FROM notification_logs ORDER BY sent_at DESC LIMIT 20;';


-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_fcm_tokens TO authenticated;
GRANT SELECT ON notification_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_notification_preferences TO authenticated;

-- Grant full access to service role
GRANT ALL ON user_fcm_tokens TO service_role;
GRANT ALL ON notification_topics TO service_role;
GRANT ALL ON user_notification_preferences TO service_role;
GRANT ALL ON notification_logs TO service_role;


-- ============================================================================
-- DONE!
-- ============================================================================

-- Verify tables were created
SELECT 
  tablename, 
  schemaname
FROM pg_tables 
WHERE tablename IN ('user_fcm_tokens', 'notification_topics', 'user_notification_preferences', 'notification_logs')
ORDER BY tablename;
