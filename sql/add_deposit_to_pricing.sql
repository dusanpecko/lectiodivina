-- Add deposit field to spiritual_exercises_pricing
-- This allows each room type to have its own deposit/handling fee

ALTER TABLE spiritual_exercises_pricing 
ADD COLUMN IF NOT EXISTS deposit DECIMAL(10,2) DEFAULT 50.00;

COMMENT ON COLUMN spiritual_exercises_pricing.deposit IS 'Deposit/handling fee for this room type (default 50 EUR)';

-- Verify
SELECT id, room_type, price, deposit 
FROM spiritual_exercises_pricing 
LIMIT 5;
