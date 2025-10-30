-- ============================================================================
-- Migration: Add locale_code to user_fcm_tokens table
-- ============================================================================
-- Vytvorené: 2025-01-28
-- Účel: Pridať locale_code stĺpec pre podporu multi-jazykových notifikácií
-- ============================================================================

-- Pridaj locale_code stĺpec
ALTER TABLE public.user_fcm_tokens 
ADD COLUMN IF NOT EXISTS locale_code TEXT CHECK (locale_code IN ('sk', 'en', 'cz', 'es', 'de'));

-- Vytvor index pre rýchlejšie vyhľadávanie podľa jazyka
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_locale ON public.user_fcm_tokens(locale_code);

-- Nastav default hodnotu 'sk' pre existujúce záznamy
UPDATE public.user_fcm_tokens 
SET locale_code = 'sk' 
WHERE locale_code IS NULL;

-- Info
SELECT 
  'Migration completed!' as status,
  COUNT(*) as total_tokens,
  COUNT(CASE WHEN locale_code IS NOT NULL THEN 1 END) as tokens_with_locale
FROM public.user_fcm_tokens;
