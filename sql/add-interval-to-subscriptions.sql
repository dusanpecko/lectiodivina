-- Add interval column to subscriptions table
-- This column stores the billing interval: 'day', 'month', 'year'

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS interval VARCHAR(20) DEFAULT 'month';

-- Update comment
COMMENT ON COLUMN subscriptions.interval IS 'Billing interval: day, month, year';

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
