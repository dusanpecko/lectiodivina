-- RÝCHLE VYTVORENIE SYSTÉMU TÉM NOTIFIKÁCIÍ
-- Spustite tento SQL v Supabase SQL Editore

-- 1. Tabuľka pre témy notifikácií
CREATE TABLE IF NOT EXISTS notification_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_sk text NOT NULL,
  name_en text,
  name_cs text,
  slug text NOT NULL UNIQUE,
  description_sk text,
  description_en text,
  description_cs text,
  icon text,
  color text DEFAULT '#4A5085',
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- 2. Tabuľka pre používateľské preferencie
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_id uuid NOT NULL REFERENCES notification_topics(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- 3. Indexy
CREATE INDEX IF NOT EXISTS idx_notification_topics_slug ON notification_topics(slug);
CREATE INDEX IF NOT EXISTS idx_notification_topics_active ON notification_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_topic_id ON user_notification_preferences(topic_id);

-- 4. Pridanie topic_id do existujúcich tabuliek (optional - pre prepojenie)
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES notification_topics(id);
ALTER TABLE scheduled_notifications ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES notification_topics(id);

-- 5. Predvolené témy
INSERT INTO notification_topics (slug, name_sk, name_en, name_cs, description_sk, icon, color, is_default, display_order, category)
VALUES 
  ('daily-readings', 'Denné čítania', 'Daily Readings', 'Denní čtení', 'Pravidelné denné čítania z Písma svätého', 'book-open', '#4A5085', true, 1, 'spiritual'),
  ('special-occasions', 'Príležitostné oznamy', 'Special Occasions', 'Příležitostná oznámení', 'Špeciálne udalosti a sviatky', 'bell', '#F59E0B', true, 2, 'news'),
  ('prayers', 'Modlitby', 'Prayers', 'Modlitby', 'Modlitbové podnety', 'hands-praying', '#10B981', false, 3, 'spiritual'),
  ('rosary', 'Ruženec', 'Rosary', 'Růženec', 'Spoločné ružence', 'rosary', '#8B5CF6', false, 4, 'spiritual'),
  ('events', 'Udalosti', 'Events', 'Události', 'Nadchádzajúce podujatia', 'calendar', '#EF4444', false, 5, 'news')
ON CONFLICT (slug) DO NOTHING;

-- 6. Nastavenie RLS (Row Level Security)

-- Najprv zrušíme existujúce politiky (ak existujú)
DROP POLICY IF EXISTS "Anyone can view active topics" ON notification_topics;
DROP POLICY IF EXISTS "Admin can manage topics" ON notification_topics;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_notification_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_notification_preferences;

-- Pre jednoduchosť vypneme RLS (API používa service role key)
ALTER TABLE notification_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences DISABLE ROW LEVEL SECURITY;

-- HOTOVO! Systém tém je pripravený.
-- Teraz môžete spustiť: SELECT * FROM notification_topics;
