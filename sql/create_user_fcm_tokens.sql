-- Vytvorenie tabuľky pre FCM tokeny používateľov
-- Táto tabuľka ukladá Firebase Cloud Messaging tokeny pre push notifikácie

CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,                    -- FCM token
  device_id text,                         -- Identifikátor zariadenia (voliteľné)
  device_type text,                       -- 'android', 'ios', 'web'
  app_version text,                       -- Verzia aplikácie
  
  is_active boolean DEFAULT true,         -- Či je token aktívny
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone DEFAULT now(),
  
  -- Unikátny constraint - jeden token môže byť len pre jedného používateľa
  UNIQUE(token)
);

-- Indexy pre optimalizáciu
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_active ON user_fcm_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_token ON user_fcm_tokens(token);

-- Trigger pre aktualizáciu updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_fcm_tokens_updated_at BEFORE UPDATE ON user_fcm_tokens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS policies
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Používatelia môžu vidieť len svoje tokeny
CREATE POLICY "Users can view own tokens" ON user_fcm_tokens
    FOR SELECT
    USING (auth.uid() = user_id);

-- Používatelia môžu spravovať len svoje tokeny  
CREATE POLICY "Users can manage own tokens" ON user_fcm_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Admini môžu čítať všetky tokeny (pre odosielanie notifikácií)
CREATE POLICY "Service role can read all tokens" ON user_fcm_tokens
    FOR SELECT
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Komentáre
COMMENT ON TABLE user_fcm_tokens IS 'FCM tokeny používateľov pre push notifikácie';
COMMENT ON COLUMN user_fcm_tokens.token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN user_fcm_tokens.device_id IS 'Unikátny identifikátor zariadenia';
COMMENT ON COLUMN user_fcm_tokens.is_active IS 'False pre neplatné/expired tokeny';