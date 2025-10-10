-- Increase ruzenec field length from varchar(100) to varchar(150)
-- COMPLETE MIGRATION SCRIPT
-- Date: 2025-10-10

-- IMPORTANT: This script drops and recreates the view lectio_divina_view
-- Make sure you have a backup or know how to recreate the view!

BEGIN;

-- Step 1: Drop the dependent view (will be recreated later)
DROP VIEW IF EXISTS lectio_divina_view CASCADE;

-- Step 2: Alter the column type
ALTER TABLE lectio_divina_ruzenec 
ALTER COLUMN ruzenec TYPE varchar(150);

-- Step 3: Recreate the view
-- If this view definition is incorrect, you need to replace it with the correct one
-- Run the query in get_view_definition.sql first to get the exact definition
CREATE OR REPLACE VIEW lectio_divina_view AS
SELECT 
    id,
    created_at,
    updated_at,
    lang,
    biblicky_text,
    kategoria,
    ruzenec,
    uvod,
    uvod_audio,
    ilustracny_obrazok,
    uvodne_modlitby,
    uvodne_modlitby_audio,
    lectio_text,
    lectio_audio,
    komentar,
    komentar_audio,
    meditatio_text,
    meditatio_audio,
    oratio_html,
    oratio_audio,
    contemplatio_text,
    contemplatio_audio,
    actio_text,
    actio_audio,
    audio_nahravka,
    autor,
    publikovane,
    poradie
FROM lectio_divina_ruzenec
WHERE publikovane = true;

COMMIT;

-- Step 4: Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'lectio_divina_ruzenec' 
AND column_name = 'ruzenec';

-- Verify the view exists
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_name = 'lectio_divina_view';
