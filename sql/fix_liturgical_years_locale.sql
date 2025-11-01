-- =====================================================
-- FIX: Pridať locale_code do liturgical_years
-- =====================================================
-- Problém: Aktuálne môžeme mať len jeden kalendár na rok
-- Riešenie: Pridáme locale_code aby sme mali kalendáre v rôznych jazykoch
-- =====================================================

-- 1. Pridáme stĺpec locale_code do liturgical_years
ALTER TABLE liturgical_years 
ADD COLUMN IF NOT EXISTS locale_code VARCHAR(2) DEFAULT 'sk' REFERENCES locales(code);

-- 2. Aktualizujeme existujúce záznamy
UPDATE liturgical_years 
SET locale_code = 'sk' 
WHERE locale_code IS NULL;

-- 3. Zmeníme constraint - unikátny je teraz year + locale_code
ALTER TABLE liturgical_years 
DROP CONSTRAINT IF EXISTS liturgical_years_year_key;

ALTER TABLE liturgical_years 
ADD CONSTRAINT liturgical_years_year_locale_unique 
UNIQUE (year, locale_code);

-- 4. Pridáme index pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_liturgical_years_year_locale 
ON liturgical_years(year, locale_code);

-- 5. Komentár
COMMENT ON COLUMN liturgical_years.locale_code IS 'Jazyk kalendára (sk, cs, en, es) - umožňuje mať rovnaký rok v rôznych jazykoch';

-- 6. Ukážka použitia:
-- Pre rok 2025 môžeme mať:
-- - (2025, 'sk', 'A', 2) - slovenský kalendár
-- - (2025, 'cs', 'A', 2) - český kalendár  
-- - (2025, 'es', 'A', 2) - španielsky kalendár
-- atď.

-- =====================================================
-- HOTOVO - Teraz môžeme mať viacero kalendárov pre jeden rok
-- =====================================================