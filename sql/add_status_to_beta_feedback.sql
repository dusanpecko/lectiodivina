-- Add status field to beta_feedback table to support "Sent to Task" status
-- This allows tracking feedback that has been converted into tasks

-- Add new status field with enum-like values
ALTER TABLE beta_feedback 
ADD COLUMN status VARCHAR(50) DEFAULT 'new' 
CHECK (status IN ('new', 'resolved', 'sent_to_task'));

-- Create index for performance
CREATE INDEX idx_beta_feedback_status ON beta_feedback(status);

-- Update existing records to use new status field
-- resolved=true -> status='resolved'  
-- resolved=false -> status='new'
UPDATE beta_feedback 
SET status = CASE 
  WHEN resolved = true THEN 'resolved'
  ELSE 'new'
END;

-- Note: We keep the resolved column for backward compatibility
-- but new code should use the status column