-- Databázová schéma pre systém tém notifikácií

-- ==================================================
-- TABUĽKA 1: notification_topics (Témy notifikácií)
-- ==================================================
-- Táto tabuľka obsahuje všetky dostupné témy notifikácií
-- Admin môže pridávať, upravovať a deaktivovať témy

CREATE TABLE IF NOT EXISTS notification_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Základné informácie
  name_sk text NOT NULL,                    -- Názov témy v slovenčine (napr. "Denné čítania")
  name_en text,                             -- Názov témy v angličtine
  name_cs text,                             -- Názov témy v češtine
  
  slug text NOT NULL UNIQUE,                -- URL-friendly identifikátor (napr. "daily-readings")
  
  description_sk text,                      -- Popis témy v slovenčine
  description_en text,
  description_cs text,
  
  -- Vizuálne vlastnosti
  icon text,                                -- Názov ikony (napr. "book", "bell", "heart")
  color text DEFAULT '#4A5085',             -- Hex farba témy
  
  -- Nastavenia
  is_active boolean DEFAULT true,           -- Či je téma aktívna
  is_default boolean DEFAULT false,         -- Či je táto téma predvolená pre nových užívateľov
  
  -- Poradie a trieda
  display_order integer DEFAULT 0,          -- Poradie zobrazovania (nižšie číslo = vyššie)
  category text,                            -- Kategória (napr. "spiritual", "educational", "news")
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Indexy pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_notification_topics_slug ON notification_topics(slug);
CREATE INDEX IF NOT EXISTS idx_notification_topics_active ON notification_topics(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_topics_order ON notification_topics(display_order);

-- ==================================================
-- TABUĽKA 2: user_notification_preferences
-- ==================================================
-- Táto tabuľka ukladá, ktoré témy má užívateľ povolené

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id uuid NOT NULL,                    -- ID užívateľa (môže byť z auth.users alebo vlastná tabuľka)
  topic_id uuid NOT NULL REFERENCES notification_topics(id) ON DELETE CASCADE,
  
  -- Nastavenia
  is_enabled boolean DEFAULT true,          -- Či má užívateľ túto tému povolenú
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Unikátny constraint - jeden užívateľ môže mať len jeden záznam pre každú tému
  UNIQUE(user_id, topic_id)
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_topic_id ON user_notification_preferences(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_prefs_enabled ON user_notification_preferences(is_enabled);

-- ==================================================
-- TABUĽKA 3: Aktualizácia notification_logs
-- ==================================================
-- Pridáme foreign key na notification_topics

ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES notification_topics(id);

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_notification_logs_topic_id ON notification_logs(topic_id);

-- ==================================================
-- TABUĽKA 4: Aktualizácia scheduled_notifications
-- ==================================================
-- Pridáme foreign key na notification_topics

ALTER TABLE scheduled_notifications 
ADD COLUMN IF NOT EXISTS topic_id uuid REFERENCES notification_topics(id);

-- Index
CREATE INDEX IF NOT EXISTS idx_scheduled_notif_topic_id ON scheduled_notifications(topic_id);

-- ==================================================
-- PREDVOLENÉ TÉMY (Migrácia zo starého systému)
-- ==================================================
-- Vytvoríme témy pre existujúce "regular" a "occasional"

INSERT INTO notification_topics (slug, name_sk, name_en, name_cs, description_sk, icon, color, is_default, display_order, category)
VALUES 
  (
    'daily-readings',
    'Denné čítania',
    'Daily Readings',
    'Denní čtení',
    'Pravidelné denné čítania z Písma svätého a duchovné úvahy',
    'book-open',
    '#4A5085',
    true,
    1,
    'spiritual'
  ),
  (
    'special-occasions',
    'Príležitostné oznamy',
    'Special Occasions',
    'Příležitostná oznámení',
    'Oznamy o špeciálnych udalostiach, sviatky a dôležité informácie',
    'bell',
    '#F59E0B',
    true,
    2,
    'news'
  ),
  (
    'prayers',
    'Modlitby',
    'Prayers',
    'Modlitby',
    'Modlitbové podnety a spoločné modlitby',
    'hands-praying',
    '#10B981',
    false,
    3,
    'spiritual'
  ),
  (
    'rosary',
    'Ruženec',
    'Rosary',
    'Růženec',
    'Notifikácie o spoločných ružencoch a modlitbách',
    'rosary',
    '#8B5CF6',
    false,
    4,
    'spiritual'
  ),
  (
    'events',
    'Udalosti',
    'Events',
    'Události',
    'Oznamy o nadchádzajúcich podujatiach a stretnutiach',
    'calendar',
    '#EF4444',
    false,
    5,
    'news'
  )
ON CONFLICT (slug) DO NOTHING;

-- ==================================================
-- MIGRÁCIA STARÝCH DÁT
-- ==================================================
-- Aktualizujeme existujúce notifikácie, aby mali topic_id

-- Mapa: 'regular' → 'daily-readings'
UPDATE notification_logs 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'daily-readings')
WHERE topic = 'regular' AND topic_id IS NULL;

-- Mapa: 'occasional' → 'special-occasions'
UPDATE notification_logs 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'special-occasions')
WHERE topic = 'occasional' AND topic_id IS NULL;

-- Rovnaká migrácia pre scheduled_notifications
UPDATE scheduled_notifications 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'daily-readings')
WHERE topic = 'regular' AND topic_id IS NULL;

UPDATE scheduled_notifications 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'special-occasions')
WHERE topic = 'occasional' AND topic_id IS NULL;

-- ==================================================
-- RLS POLITIKY (Row Level Security)
-- ==================================================

-- notification_topics - čítanie pre všetkých, zápis len pre adminov
ALTER TABLE notification_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active topics" ON notification_topics
  FOR SELECT
  USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "Admin can manage topics" ON notification_topics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = auth.jwt()->>'email'
      AND users.role = 'admin'
    )
  );

-- user_notification_preferences - užívateľ vidí len svoje nastavenia
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_notification_preferences
  FOR SELECT
  USING (user_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Users can manage own preferences" ON user_notification_preferences
  FOR ALL
  USING (user_id::text = auth.uid()::text OR auth.role() = 'service_role');

-- ==================================================
-- FUNKCIE A TRIGGERY
-- ==================================================

-- Funkcia pre automatické nastavenie updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pre notification_topics
CREATE TRIGGER update_notification_topics_updated_at
  BEFORE UPDATE ON notification_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pre user_notification_preferences
CREATE TRIGGER update_user_notif_prefs_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- VIEW pre ľahšie dotazovanie
-- ==================================================

-- View: Aktívne témy s počtom užívateľov
CREATE OR REPLACE VIEW notification_topics_stats AS
SELECT 
  nt.*,
  COUNT(DISTINCT unp.user_id) FILTER (WHERE unp.is_enabled = true) as subscriber_count,
  COUNT(nl.id) as total_sent
FROM notification_topics nt
LEFT JOIN user_notification_preferences unp ON nt.id = unp.topic_id
LEFT JOIN notification_logs nl ON nt.id = nl.topic_id
GROUP BY nt.id;

-- ==================================================
-- POZNÁMKY
-- ==================================================
/*
Prehľad štruktúry:

1. notification_topics
   - Obsahuje všetky témy (admin ich spravuje)
   - Podporuje viacjazyčnosť
   - Vizuálne nastavenia (ikona, farba)
   
2. user_notification_preferences
   - Ukladá preferencie každého užívateľa
   - Jeden záznam = jeden užívateľ + jedna téma
   - Default: všetky predvolené témy sú povolené
   
3. Kompatibilita so starým systémom
   - Starý "topic" stĺpec zostáva (pre backward compatibility)
   - Nový "topic_id" sa používa pre nový systém
   - Migrácia mapuje 'regular' → 'daily-readings'
   
4. Bezpečnosť
   - RLS zapnuté na oboch tabuľkách
   - Užívatelia vidia len svoje preferencie
   - Admini majú plný prístup
*/
