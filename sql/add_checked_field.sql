-- SQL príkaz pre Supabase - pridanie checkbox poľa do tabuľky lectio_sources
-- Spustiť v Supabase SQL editore

-- 1. Pridanie nového stĺpca 'checked' do tabuľky lectio_sources
ALTER TABLE lectio_sources 
ADD COLUMN checked SMALLINT DEFAULT 0 NOT NULL;

-- 2. Aktualizovanie všetkých existujúcich záznamov na defaultnú hodnotu 0 (nezaškrtnuté)
UPDATE lectio_sources 
SET checked = 0 
WHERE checked IS NULL;

-- 3. Pridanie komentára k stĺpcu pre dokumentáciu
COMMENT ON COLUMN lectio_sources.checked IS 'Checkbox field: 0 = unchecked, 1 = checked';

-- 4. Overenie zmien - tento SELECT môžeš spustiť na kontrolu
-- SELECT id, hlava, lang, checked FROM lectio_sources ORDER BY id DESC LIMIT 10;