-- Vytvorenie tabuľky notification_logs (ak neexistuje)
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  locale_id integer,
  topic text NOT NULL CHECK (topic IN ('regular', 'occasional')),
  fcm_message_id text,
  subscriber_count integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Pridanie foreign key constraintu (len ak tabuľka locales existuje)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'locales') THEN
    ALTER TABLE notification_logs
    ADD CONSTRAINT notification_logs_locale_id_fkey
    FOREIGN KEY (locale_id) REFERENCES locales(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_locale_id ON notification_logs(locale_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_topic ON notification_logs(topic);

-- RLS (Row Level Security) - povoľ prístup len administrátorom
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy pre čítanie (len admin)
CREATE POLICY "Admin can read notification logs" ON notification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = auth.jwt()->>'email'
      AND users.role = 'admin'
    )
  );

-- Policy pre vkladanie (len admin)
CREATE POLICY "Admin can insert notification logs" ON notification_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = auth.jwt()->>'email'
      AND users.role = 'admin'
    )
  );

-- Policy pre mazanie (len admin)
CREATE POLICY "Admin can delete notification logs" ON notification_logs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = auth.jwt()->>'email'
      AND users.role = 'admin'
    )
  );

-- Povoľ service role prístup (pre API routes)
CREATE POLICY "Service role full access" ON notification_logs
  FOR ALL
  USING (auth.role() = 'service_role');
