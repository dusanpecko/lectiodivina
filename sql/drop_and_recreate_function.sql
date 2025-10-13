-- Drop ALL versions of the function (old and new)
DROP FUNCTION IF EXISTS get_bible_chapters_summary(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER);

-- Recreate with correct INTEGER type
CREATE OR REPLACE FUNCTION get_bible_chapters_summary(
  p_locale_id TEXT DEFAULT NULL,
  p_translation_id TEXT DEFAULT NULL,
  p_book_id TEXT DEFAULT NULL,
  p_chapter INTEGER DEFAULT NULL  -- ✅ INTEGER type
)
RETURNS TABLE (
  locale_id TEXT,
  translation_id TEXT,
  book_id TEXT,
  chapter INTEGER,  -- ✅ INTEGER type
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO service_role;
