-- Create error_reports table for user-reported content errors
CREATE TABLE IF NOT EXISTS error_reports (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User information
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  
  -- Lectio information
  lectio_id BIGINT,
  lectio_date DATE,
  step_key TEXT NOT NULL, -- 'bible', 'lectio', 'meditatio', 'oratio', 'contemplatio', 'actio'
  step_name TEXT NOT NULL, -- Display name like "LECTIO - Čítanie"
  
  -- Error details
  original_text TEXT NOT NULL,
  corrected_text TEXT NOT NULL,
  error_severity TEXT NOT NULL CHECK (error_severity IN ('low', 'medium', 'high', 'critical')),
  -- low: minor typo, medium: grammar error, high: meaning error, critical: wrong information
  
  additional_notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- Add indexes for better performance
CREATE INDEX idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX idx_error_reports_lectio_date ON error_reports(lectio_date);
CREATE INDEX idx_error_reports_status ON error_reports(status);
CREATE INDEX idx_error_reports_created_at ON error_reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON error_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON error_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON error_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update reports (review them)
CREATE POLICY "Admins can update reports"
  ON error_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE error_reports IS 'User-reported errors in lectio divina content for quality control';
