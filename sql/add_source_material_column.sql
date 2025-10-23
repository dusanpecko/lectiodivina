-- Pridanie stĺpca source_material do tabuľky lectio_sources
-- Tento stĺpec slúži na uloženie zdrojového materiálu, komentárov alebo dodatočného textu
-- ktorý sa používa pri AI generovaní Lectio Divina

ALTER TABLE lectio_sources 
ADD COLUMN IF NOT EXISTS source_material TEXT;

-- Pridaj komentár pre dokumentáciu
COMMENT ON COLUMN lectio_sources.source_material IS 'Zdrojový materiál, komentáre a dodatočný text použitý pri AI generovaní Lectio Divina';
