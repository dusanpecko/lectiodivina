-- Spustiť v Supabase SQL Editor
-- https://supabase.com/dashboard/project/unnijykbupxguogrkolj/sql

ALTER TABLE lectio_sources 
ADD COLUMN IF NOT EXISTS source_material TEXT;

COMMENT ON COLUMN lectio_sources.source_material IS 'Zdrojový materiál, komentáre a dodatočný text použitý pri AI generovaní Lectio Divina';

-- Overiť pridanie stĺpca
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lectio_sources' 
  AND column_name = 'source_material';
