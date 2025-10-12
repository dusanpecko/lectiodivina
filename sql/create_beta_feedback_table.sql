-- Create beta_feedback table for simple beta feedback
CREATE TABLE beta_feedback (
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
CREATE INDEX idx_beta_feedback_created_at ON beta_feedback(created_at DESC);
CREATE INDEX idx_beta_feedback_resolved ON beta_feedback(resolved);

-- Enable RLS
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert (for anonymous bug reports)
CREATE POLICY "Allow anonymous beta feedback submissions" ON beta_feedback
    FOR INSERT 
    WITH CHECK (true);

-- Policy to allow admins to view all feedback
CREATE POLICY "Admins can view all beta feedback" ON beta_feedback
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );

-- Policy to allow admins to update feedback (mark as resolved, add notes)
CREATE POLICY "Admins can update beta feedback" ON beta_feedback
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.role = 'admin'
        )
    );