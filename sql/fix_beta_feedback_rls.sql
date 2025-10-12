-- Fix RLS policies for beta_feedback table to work with users table instead of auth.users

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all beta feedback" ON beta_feedback;
DROP POLICY IF EXISTS "Admins can update beta feedback" ON beta_feedback;

-- Create new policies that check users table instead of auth.users
CREATE POLICY "Admins can view all beta feedback" ON beta_feedback
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role = 'admin'
        )
    );

-- Policy to allow admins to update feedback (mark as resolved, add notes)
CREATE POLICY "Admins can update beta feedback" ON beta_feedback
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email'
            AND users.role = 'admin'
        )
    );