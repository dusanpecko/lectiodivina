-- Backfill provider data from auth.users to public.users table
-- This syncs the provider information from Supabase Auth to our users table

UPDATE public.users 
SET provider = COALESCE(
  (
    SELECT raw_app_meta_data->>'provider'
    FROM auth.users au
    WHERE au.id = users.id
  ),
  'email'
)
WHERE provider IS NULL;

-- Verify the update
SELECT 
  provider,
  COUNT(*) as count
FROM public.users
GROUP BY provider
ORDER BY count DESC;
