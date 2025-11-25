-- Fix ALL foreign key constraints that reference users table
-- This ensures that when a user is deleted, all related data is automatically deleted
-- Uses IF EXISTS to skip tables that don't exist

-- 1. Notes table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'user_id') THEN
    -- Clean up orphaned records
    DELETE FROM notes WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
    
    ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
    ALTER TABLE notes ADD CONSTRAINT notes_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed notes table';
  END IF;
END $$;

-- 2. Subscriptions table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
    ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed subscriptions table';
  END IF;
END $$;

-- 3. Orders table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
    ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed orders table';
  END IF;
END $$;

-- 4. Donations table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'user_id') THEN
    ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_user_id_fkey;
    ALTER TABLE donations ADD CONSTRAINT donations_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed donations table';
  END IF;
END $$;

-- 5. User notification preferences
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notification_preferences' AND column_name = 'user_id') THEN
    ALTER TABLE user_notification_preferences DROP CONSTRAINT IF EXISTS user_notification_preferences_user_id_fkey;
    ALTER TABLE user_notification_preferences ADD CONSTRAINT user_notification_preferences_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed user_notification_preferences table';
  END IF;
END $$;

-- 6. Audit logs table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
    -- Clean up orphaned records
    DELETE FROM audit_logs WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
    
    ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed audit_logs table';
  END IF;
END $$;

-- 7. AI usage tracking
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_usage_tracking' AND column_name = 'user_id') THEN
    ALTER TABLE ai_usage_tracking DROP CONSTRAINT IF EXISTS ai_usage_tracking_user_id_fkey;
    ALTER TABLE ai_usage_tracking ADD CONSTRAINT ai_usage_tracking_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed ai_usage_tracking table';
  END IF;
END $$;

-- 8. Prayer timings
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prayer_timings' AND column_name = 'user_id') THEN
    ALTER TABLE prayer_timings DROP CONSTRAINT IF EXISTS prayer_timings_user_id_fkey;
    ALTER TABLE prayer_timings ADD CONSTRAINT prayer_timings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed prayer_timings table';
  END IF;
END $$;

-- 9. Lectio completions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lectio_completions' AND column_name = 'user_id') THEN
    ALTER TABLE lectio_completions DROP CONSTRAINT IF EXISTS lectio_completions_user_id_fkey;
    ALTER TABLE lectio_completions ADD CONSTRAINT lectio_completions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed lectio_completions table';
  END IF;
END $$;

-- 10. User favorites
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_favorites' AND column_name = 'user_id') THEN
    ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS user_favorites_user_id_fkey;
    ALTER TABLE user_favorites ADD CONSTRAINT user_favorites_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed user_favorites table';
  END IF;
END $$;

-- 11. User FCM tokens
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_fcm_tokens' AND column_name = 'user_id') THEN
    -- Clean up orphaned records
    DELETE FROM user_fcm_tokens WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
    
    ALTER TABLE user_fcm_tokens DROP CONSTRAINT IF EXISTS user_fcm_tokens_user_id_fkey;
    ALTER TABLE user_fcm_tokens ADD CONSTRAINT user_fcm_tokens_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed user_fcm_tokens table';
  END IF;
END $$;

-- 12. Intentions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intentions' AND column_name = 'user_id') THEN
    -- First, clean up orphaned records (where user_id doesn't exist in users table)
    DELETE FROM intentions 
    WHERE user_id IS NOT NULL 
      AND user_id NOT IN (SELECT id FROM users);
    
    RAISE NOTICE 'Cleaned up orphaned records in intentions table';
    
    -- Now add the constraint
    ALTER TABLE intentions DROP CONSTRAINT IF EXISTS intentions_user_id_fkey;
    ALTER TABLE intentions ADD CONSTRAINT intentions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed intentions table';
  END IF;
END $$;

-- 13. Bank payments (matched payments should reference user)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_payments' AND column_name = 'user_id') THEN
    ALTER TABLE bank_payments DROP CONSTRAINT IF EXISTS bank_payments_user_id_fkey;
    ALTER TABLE bank_payments ADD CONSTRAINT bank_payments_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Fixed bank_payments table (SET NULL on delete)';
  END IF;
END $$;

-- Verify all constraints now have CASCADE DELETE
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE kcu.column_name = 'user_id' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
