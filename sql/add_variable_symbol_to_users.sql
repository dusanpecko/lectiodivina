-- Add variable_symbol column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS variable_symbol TEXT UNIQUE;

-- Create index for fast matching
CREATE INDEX IF NOT EXISTS idx_users_variable_symbol ON users(variable_symbol) WHERE variable_symbol IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.variable_symbol IS 'Variabilný symbol pre párovanie bankových platieb';
