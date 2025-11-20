-- Add billing and company information to users table
-- For storing saved shipping/billing addresses and company details

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ico TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dic TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS iban TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.shipping_address IS 'Default shipping address: {name, street, city, postal_code, country, phone, email}';
COMMENT ON COLUMN users.billing_address IS 'Billing/correspondence address if different from shipping';
COMMENT ON COLUMN users.company_name IS 'Company name for business purchases';
COMMENT ON COLUMN users.ico IS 'IČO - Slovak company registration number';
COMMENT ON COLUMN users.dic IS 'DIČ - Slovak tax ID number';
COMMENT ON COLUMN users.iban IS 'IBAN for refunds or invoicing';

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_ico ON users(ico) WHERE ico IS NOT NULL;
