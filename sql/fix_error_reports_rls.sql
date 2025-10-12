-- Update RLS policies for error_reports table to allow anonymous submissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit error reports" ON error_reports;
DROP POLICY IF EXISTS "Admins can view all error reports" ON error_reports;
DROP POLICY IF EXISTS "Admins can update error reports" ON error_reports;

-- Recreate policies with explicit anonymous access
CREATE POLICY "Allow anonymous error report submissions" ON error_reports
    FOR INSERT 
    WITH CHECK (true);

-- Policy to allow authenticated users and admins to view reports
CREATE POLICY "Authenticated users can view error reports" ON error_reports
    FOR SELECT 
    USING (
        -- Allow if user is admin
        (EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        ))
        OR
        -- Allow if user is authenticated (for their own reports or general viewing)
        (auth.uid() IS NOT NULL)
    );

-- Policy to allow admins to update reports
CREATE POLICY "Admins can update error reports" ON error_reports
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Make sure RLS is enabled
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Verify the table structure supports anonymous submissions
-- The table should not have any NOT NULL constraints on user-related fields