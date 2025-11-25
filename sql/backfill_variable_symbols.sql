-- Backfill script to assign variable symbols to existing users
-- Run this AFTER running auto_generate_variable_symbol.sql

-- Check how many users need VS
SELECT 
  COUNT(*) as users_without_vs
FROM users 
WHERE variable_symbol IS NULL OR variable_symbol = '';

-- Assign VS to all existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
  counter INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting backfill of variable symbols...';
  
  FOR user_record IN 
    SELECT id, email, created_at 
    FROM users 
    WHERE variable_symbol IS NULL OR variable_symbol = ''
    ORDER BY created_at ASC
  LOOP
    UPDATE users 
    SET variable_symbol = generate_variable_symbol()
    WHERE id = user_record.id;
    
    counter := counter + 1;
    
    -- Log progress every 10 users
    IF counter % 10 = 0 THEN
      RAISE NOTICE 'Processed % users...', counter;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete! Assigned VS to % users.', counter;
END $$;

-- Verification - show updated users
SELECT 
  id, 
  email, 
  variable_symbol, 
  created_at 
FROM users 
WHERE variable_symbol IS NOT NULL
ORDER BY created_at ASC
LIMIT 20;

-- Count results
SELECT 
  COUNT(*) FILTER (WHERE variable_symbol IS NOT NULL) as users_with_vs,
  COUNT(*) FILTER (WHERE variable_symbol IS NULL OR variable_symbol = '') as users_without_vs,
  COUNT(*) as total_users
FROM users;
