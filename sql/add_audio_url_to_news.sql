-- Add audio_url column to news table
-- This will store ElevenLabs generated audio URLs

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN news.audio_url IS 'URL of the ElevenLabs TTS generated audio file stored in Supabase Storage';
