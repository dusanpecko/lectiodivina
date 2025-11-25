-- Add payment_type column to bank_payments table
-- This allows categorizing payments as donation, shop order, or subscription

ALTER TABLE bank_payments 
ADD COLUMN IF NOT EXISTS payment_type TEXT CHECK (payment_type IN ('donation', 'shop', 'subscription'));

-- Add related_id to link payment to specific donation/order/subscription
ALTER TABLE bank_payments
ADD COLUMN IF NOT EXISTS related_id UUID;

-- Create index for payment_type
CREATE INDEX IF NOT EXISTS idx_bank_payments_type ON bank_payments(payment_type) WHERE payment_type IS NOT NULL;

-- Create index for related_id
CREATE INDEX IF NOT EXISTS idx_bank_payments_related ON bank_payments(related_id) WHERE related_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN bank_payments.payment_type IS 'Type of payment: donation, shop (order), or subscription';
COMMENT ON COLUMN bank_payments.related_id IS 'ID of related donation/order/subscription record';
