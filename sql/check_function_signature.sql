-- Check function signature (corrected query)
SELECT 
  routine_name,
  string_agg(parameter_name || ': ' || p.data_type, ', ' ORDER BY ordinal_position) as parameters
FROM information_schema.routines r
LEFT JOIN information_schema.parameters p 
  ON r.specific_name = p.specific_name
WHERE routine_name = 'get_bible_chapters_summary'
GROUP BY routine_name, r.specific_name;
