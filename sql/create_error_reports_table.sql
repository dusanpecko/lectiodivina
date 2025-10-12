-- Create error_reports table for beta feedback
CREATE TABLE error_reports (
  id BIGSERIAL PRIMARY KEY,
  email TEXT,
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  language TEXT DEFAULT 'sk',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

-- Create index for performance
CREATE INDEX idx_error_reports_created_at ON error_reports(created_at DESC);
CREATE INDEX idx_error_reports_resolved ON error_reports(resolved);

-- Enable RLS
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (for anonymous bug reports)
CREATE POLICY "Anyone can submit error reports" ON error_reports
    FOR INSERT 
    WITH CHECK (true);

-- Policy to allow admins to view all reports
CREATE POLICY "Admins can view all error reports" ON error_reports
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Policy to allow admins to update reports (mark as resolved, add notes)
CREATE POLICY "Admins can update error reports" ON error_reports
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );