-- Add audio fields to lectio_divina_ruzenec table
-- Created: 2025-10-09
-- Description: Pridanie audio polí pre všetky sekcie Lectio Divina v ruženci

-- Pridanie nových audio stĺpcov
ALTER TABLE public.lectio_divina_ruzenec
  ADD COLUMN IF NOT EXISTS uvod_audio text NULL,
  ADD COLUMN IF NOT EXISTS uvodne_modlitby_audio text NULL,
  ADD COLUMN IF NOT EXISTS lectio_audio text NULL,
  ADD COLUMN IF NOT EXISTS komentar_audio text NULL,
  ADD COLUMN IF NOT EXISTS meditatio_audio text NULL,
  ADD COLUMN IF NOT EXISTS oratio_audio text NULL,
  ADD COLUMN IF NOT EXISTS contemplatio_audio text NULL,
  ADD COLUMN IF NOT EXISTS actio_audio text NULL;

-- Pridanie komentárov k novým stĺpcom pre dokumentáciu
COMMENT ON COLUMN public.lectio_divina_ruzenec.uvod_audio IS 'URL audio nahrávky pre úvod';
COMMENT ON COLUMN public.lectio_divina_ruzenec.uvodne_modlitby_audio IS 'URL audio nahrávky pre úvodné modlitby';
COMMENT ON COLUMN public.lectio_divina_ruzenec.lectio_audio IS 'URL audio nahrávky pre Lectio text';
COMMENT ON COLUMN public.lectio_divina_ruzenec.komentar_audio IS 'URL audio nahrávky pre komentár';
COMMENT ON COLUMN public.lectio_divina_ruzenec.meditatio_audio IS 'URL audio nahrávky pre Meditatio text';
COMMENT ON COLUMN public.lectio_divina_ruzenec.oratio_audio IS 'URL audio nahrávky pre Oratio (desiatky)';
COMMENT ON COLUMN public.lectio_divina_ruzenec.contemplatio_audio IS 'URL audio nahrávky pre Contemplatio text';
COMMENT ON COLUMN public.lectio_divina_ruzenec.actio_audio IS 'URL audio nahrávky pre Actio text';

-- Voliteľné: Premenovanie pôvodného audio_nahravka na audio_komplet pre jasnosť
-- (ak chceš zachovať pôvodné audio pole pre celý ruženec)
COMMENT ON COLUMN public.lectio_divina_ruzenec.audio_nahravka IS 'URL kompletnej audio nahrávky celého ruženec (voliteľné)';

-- Info o nových stĺpcoch
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lectio_divina_ruzenec'
  AND column_name LIKE '%_audio'
ORDER BY ordinal_position;
