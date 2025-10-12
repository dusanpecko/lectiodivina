-- ⚠️ POZNÁMKA: Táto tabuľka už existuje v databáze!
-- Tento SQL script je len pre dokumentáciu.
-- Ak tabuľka neexistuje, použite tento script:

-- 1. Vytvorenie tabuľky (EXISTUJE UŽ)
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  locale_id bigint NOT NULL,
  topic text NOT NULL,
  fcm_message_id text NOT NULL,
  subscriber_count integer DEFAULT 0,
  image_url text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT notification_logs_locale_id_fkey FOREIGN KEY (locale_id) REFERENCES locales(id),
  CONSTRAINT notification_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);

-- 2. Indexy pre výkon (EXISTUJÚ UŽ)
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_locale_id ON notification_logs(locale_id);

-- Hotovo! Tabuľka je pripravená na použitie.
