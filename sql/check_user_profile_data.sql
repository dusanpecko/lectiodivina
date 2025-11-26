-- Check current user profile data
-- Run this to see what data exists in users table

SELECT 
  id,
  email,
  full_name,
  phone,
  street,
  city,
  postal_code,
  created_at
FROM users
WHERE email = 'YOUR_EMAIL_HERE'  -- Replace with your email
LIMIT 1;

-- Or to see all users with their profile completeness:
SELECT 
  email,
  full_name,
  CASE WHEN phone IS NOT NULL THEN '✓' ELSE '✗' END as has_phone,
  CASE WHEN street IS NOT NULL THEN '✓' ELSE '✗' END as has_street,
  CASE WHEN city IS NOT NULL THEN '✓' ELSE '✗' END as has_city,
  CASE WHEN postal_code IS NOT NULL THEN '✓' ELSE '✗' END as has_postal_code
FROM users
ORDER BY created_at DESC
LIMIT 10;
