-- Fix foreign key constraint on notes table to allow CASCADE DELETE
-- This fixes the error: "Unable to delete row as it is currently referenced by a foreign key constraint"

-- First, drop the existing constraint
ALTER TABLE notes
  DROP CONSTRAINT IF EXISTS notes_user_id_fkey;

-- Add it back with CASCADE DELETE
ALTER TABLE notes
  ADD CONSTRAINT notes_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE;

-- Verify the constraint
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
WHERE tc.table_name = 'notes' 
  AND tc.constraint_type = 'FOREIGN KEY';
