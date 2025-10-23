-- =====================================================
-- LITURGICAL CALENDAR SYSTEM
-- =====================================================
-- Vytvorené: 2025-10-18
-- Účel: Systém pre správu liturgického kalendára a synchronizáciu s lectio_sources
-- Poznámka: Vyžaduje existujúcu tabuľku 'locales' s aktívnymi jazykmi
-- =====================================================

-- Predpoklad: tabuľka 'locales' už existuje
-- Kontrola, či máme aktívne jazyky v locales
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM locales WHERE code IN ('sk', 'cz', 'en', 'es') AND is_active = true) THEN
        RAISE NOTICE 'Upozornenie: Uistite sa, že v tabuľke locales sú aktívne jazyky (sk, cz, en, es)';
    END IF;
END $$;

-- 1. Tabuľka liturgických rokov
-- =====================================================
CREATE TABLE IF NOT EXISTS liturgical_years (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL UNIQUE, -- Liturgický rok (napr. 2025)
    lectionary_cycle VARCHAR(1) NOT NULL CHECK (lectionary_cycle IN ('A', 'B', 'C')), -- Cyklus lekcionára
    ferial_lectionary INTEGER CHECK (ferial_lectionary IN (1, 2)), -- Všedný deň lekcionár
    start_date DATE, -- Začiatok liturgického roka (1. adventná nedeľa)
    end_date DATE, -- Koniec liturgického roka
    is_generated BOOLEAN DEFAULT false, -- Či bol kalendár vygenerovaný z API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_liturgical_years_year ON liturgical_years(year);

-- Komentáre
COMMENT ON TABLE liturgical_years IS 'Liturgické roky s cyklom lekcionára (A/B/C)';
COMMENT ON COLUMN liturgical_years.year IS 'Kalendárny rok (napr. 2025)';
COMMENT ON COLUMN liturgical_years.lectionary_cycle IS 'Cyklus nedele: A, B alebo C';
COMMENT ON COLUMN liturgical_years.ferial_lectionary IS 'Cyklus všedných dní: 1 alebo 2';

-- =====================================================
-- 2. Tabuľka liturgického kalendára
-- =====================================================
CREATE TABLE IF NOT EXISTS liturgical_calendar (
    id SERIAL PRIMARY KEY,
    datum DATE NOT NULL,
    locale_code VARCHAR(2) NOT NULL DEFAULT 'sk',
    
    -- Liturgická sezóna
    season VARCHAR(20), -- advent, christmas, ordinary, lent, easter
    season_week INTEGER, -- Číslo týždňa v sezóne
    weekday VARCHAR(20), -- monday, tuesday, ...
    
    -- Hlavná slávnosť/sviatok
    celebration_title TEXT, -- Názov hlavného sviatku/slávnosti
    celebration_rank TEXT, -- slavnost, svátek, památka, ferie, ...
    celebration_rank_num DECIMAL(3,2), -- Číselná priorita (1.2, 2.5, 3.1, ...)
    celebration_colour VARCHAR(20), -- white, red, green, violet
    
    -- Alternatívna slávnosť (ak existuje)
    alternative_celebration_title TEXT,
    alternative_celebration_rank TEXT,
    alternative_celebration_rank_num DECIMAL(3,2),
    alternative_celebration_colour VARCHAR(20),
    
    -- Prepojenie na lectio_sources
    lectio_hlava TEXT, -- Názov z lectio_sources (pre synchronizáciu)
    
    -- Meniny (slovenský/český/anglický/španielsky kalendár)
    meniny TEXT, -- Meniny (napr. "Mikuláš, Nikola")
    
    -- Metadata
    liturgical_year_id INTEGER REFERENCES liturgical_years(id) ON DELETE CASCADE,
    source_api TEXT DEFAULT 'calapi.inadiutorium.cz', -- Odkiaľ pochádza záznam
    is_custom_edit BOOLEAN DEFAULT false, -- Či bol manuálne upravený adminom
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key na locales tabuľku
    CONSTRAINT fk_liturgical_calendar_locale 
        FOREIGN KEY (locale_code) 
        REFERENCES locales(code) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Unikátny constraint: jeden deň má jeden jazyk
    UNIQUE(datum, locale_code)
);

-- Indexy pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_liturgical_calendar_datum ON liturgical_calendar(datum);
CREATE INDEX IF NOT EXISTS idx_liturgical_calendar_locale ON liturgical_calendar(locale_code);
CREATE INDEX IF NOT EXISTS idx_liturgical_calendar_datum_locale ON liturgical_calendar(datum, locale_code);
CREATE INDEX IF NOT EXISTS idx_liturgical_calendar_lectio_hlava ON liturgical_calendar(lectio_hlava);
CREATE INDEX IF NOT EXISTS idx_liturgical_calendar_year_id ON liturgical_calendar(liturgical_year_id);

-- Komentáre
COMMENT ON TABLE liturgical_calendar IS 'Kompletný liturgický kalendár s meninami pre každý deň';
COMMENT ON COLUMN liturgical_calendar.locale_code IS 'Kód jazyka z tabuľky locales (sk, cz, en, es)';
COMMENT ON COLUMN liturgical_calendar.lectio_hlava IS 'Mapovanie na lectio_sources.hlava pre synchronizáciu obsahu';
COMMENT ON COLUMN liturgical_calendar.is_custom_edit IS 'TRUE ak admin manuálne upravil tento záznam';

-- =====================================================
-- 3. Tabuľka menín (Name days for all languages)
-- =====================================================
CREATE TABLE IF NOT EXISTS name_days (
    id SERIAL PRIMARY KEY,
    datum DATE NOT NULL,
    locale_code VARCHAR(2) NOT NULL,
    meniny TEXT NOT NULL, -- Zoznam mien oddelených čiarkou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key na locales tabuľku
    CONSTRAINT fk_name_days_locale 
        FOREIGN KEY (locale_code) 
        REFERENCES locales(code) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    UNIQUE(datum, locale_code)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_name_days_datum_locale ON name_days(datum, locale_code);
CREATE INDEX IF NOT EXISTS idx_name_days_locale ON name_days(locale_code);

COMMENT ON TABLE name_days IS 'Meniny pre rôzne jazyky podľa tabuľky locales pre každý deň v roku';
COMMENT ON COLUMN name_days.locale_code IS 'Kód jazyka z tabuľky locales (sk, cz, en, es)';

-- =====================================================
-- 4. RLS Policies (Row Level Security)
-- =====================================================

-- Povoliť RLS
ALTER TABLE liturgical_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE liturgical_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_days ENABLE ROW LEVEL SECURITY;

-- Verejné čítanie pre všetkých
CREATE POLICY "Verejné čítanie liturgical_years" ON liturgical_years
    FOR SELECT USING (true);

CREATE POLICY "Verejné čítanie liturgical_calendar" ON liturgical_calendar
    FOR SELECT USING (true);

CREATE POLICY "Verejné čítanie name_days" ON name_days
    FOR SELECT USING (true);

-- Admin môže všetko (INSERT, UPDATE, DELETE)
-- Poznámka: Je potrebné mať definovanú auth.users tabuľku a admin role

-- =====================================================
-- 5. Funkcie pre automatické updaty
-- =====================================================

-- Automatická aktualizácia updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pre liturgical_years
DROP TRIGGER IF EXISTS update_liturgical_years_updated_at ON liturgical_years;
CREATE TRIGGER update_liturgical_years_updated_at
    BEFORE UPDATE ON liturgical_years
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pre liturgical_calendar
DROP TRIGGER IF EXISTS update_liturgical_calendar_updated_at ON liturgical_calendar;
CREATE TRIGGER update_liturgical_calendar_updated_at
    BEFORE UPDATE ON liturgical_calendar
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. Vzorové dáta pre testovanie
-- =====================================================

-- Vloženie liturgického roku 2025 (cyklus A)
INSERT INTO liturgical_years (year, lectionary_cycle, ferial_lectionary, start_date, end_date, is_generated)
VALUES (2025, 'A', 2, '2024-12-01', '2025-11-29', false)
ON CONFLICT (year) DO NOTHING;

-- =====================================================
-- HOTOVO
-- =====================================================
-- Poznámky:
-- 1. Tabuľka liturgical_calendar bude naplnená z API calapi.inadiutorium.cz
-- 2. Admin stránka umožní generovanie kalendára pre vybraný rok
-- 3. Meniny sa budú dopĺňať manuálne alebo z lokálnej databázy
-- 4. lectio_hlava slúži na mapovanie medzi liturgical_calendar a lectio_sources
-- =====================================================
