-- Add form_embed_code column to news table
-- This will store EasyForms embed code for interactive forms

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS form_embed_code TEXT;

COMMENT ON COLUMN news.form_embed_code IS 'EasyForms embed code (HTML + script) for displaying forms in articles';
