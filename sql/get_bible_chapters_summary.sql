-- RPC function to get Bible chapters summary efficiently
-- This bypasses Supabase's 1000 record limit by aggregating data server-side

CREATE OR REPLACE FUNCTION get_bible_chapters_summary(
  p_locale_id TEXT DEFAULT NULL,
  p_translation_id TEXT DEFAULT NULL,
  p_book_id TEXT DEFAULT NULL,
  p_chapter INTEGER DEFAULT NULL  -- ✅ CHANGED FROM TEXT TO INTEGER
)
RETURNS TABLE (
  locale_id TEXT,
  translation_id TEXT,
  book_id TEXT,
  chapter INTEGER,  -- ✅ CHANGED FROM TEXT TO INTEGER
  verse_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bv.locale_id,
    bv.translation_id,
    bv.book_id,
    bv.chapter,
    COUNT(*) as verse_count,
    MIN(bv.created_at) as created_at
  FROM bible_verses bv
  WHERE 
    (p_locale_id IS NULL OR bv.locale_id = p_locale_id)
    AND (p_translation_id IS NULL OR bv.translation_id = p_translation_id)
    AND (p_book_id IS NULL OR bv.book_id = p_book_id)
    AND (p_chapter IS NULL OR bv.chapter = p_chapter)
  GROUP BY bv.locale_id, bv.translation_id, bv.book_id, bv.chapter
  ORDER BY bv.locale_id, bv.translation_id, bv.book_id, bv.chapter;
END;
$$ LANGUAGE plpgsql;
