-- Add user_id column to spiritual_exercises_registrations
-- This allows linking registrations to authenticated users

-- Add user_id column (nullable, since some registrations might be from non-authenticated users)
ALTER TABLE spiritual_exercises_registrations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON spiritual_exercises_registrations(user_id);

-- Add comment
COMMENT ON COLUMN spiritual_exercises_registrations.user_id IS 'Optional link to authenticated user account. NULL for guest registrations.';

-- Update RLS policies to allow users to view their own registrations
CREATE POLICY "Users can view their own registrations"
    ON spiritual_exercises_registrations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'spiritual_exercises_registrations' 
AND column_name = 'user_id';
