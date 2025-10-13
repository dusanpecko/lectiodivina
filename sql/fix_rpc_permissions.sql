-- Grant permissions on the RPC function to all roles
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) TO service_role;

-- Ensure the function is in the public schema
ALTER FUNCTION get_bible_chapters_summary(TEXT, TEXT, TEXT, INTEGER) SET search_path = public;
