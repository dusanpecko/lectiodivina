-- Bank Payments Table
-- Stores all bank transfers received

CREATE TABLE IF NOT EXISTS bank_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Transaction details from bank
  transaction_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  payer_reference TEXT, -- VS, SS, KS
  transaction_type TEXT, -- "Prijata platba"
  
  -- Counterparty info
  counterparty_account TEXT,
  counterparty_bank TEXT,
  counterparty_name TEXT,
  
  -- Messages
  message_for_recipient TEXT,
  additional_info TEXT,
  
  -- Matching with users
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  matched BOOLEAN DEFAULT false,
  matched_at TIMESTAMPTZ,
  matched_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Deduplication
  transaction_hash TEXT UNIQUE NOT NULL, -- Hash of key fields to prevent duplicates
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_transaction UNIQUE (transaction_date, amount, counterparty_account, payer_reference)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_payments_date ON bank_payments(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_payments_user ON bank_payments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_payments_matched ON bank_payments(matched);
CREATE INDEX IF NOT EXISTS idx_bank_payments_hash ON bank_payments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_bank_payments_counterparty ON bank_payments(counterparty_name);
CREATE INDEX IF NOT EXISTS idx_bank_payments_amount ON bank_payments(amount);

-- RLS Policies
ALTER TABLE bank_payments ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY service_role_all_bank_payments ON bank_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read all
CREATE POLICY admin_read_bank_payments ON bank_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Users can only see their own matched payments
CREATE POLICY users_read_own_bank_payments ON bank_payments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND matched = true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bank_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_bank_payments_updated_at ON bank_payments;
CREATE TRIGGER set_bank_payments_updated_at
  BEFORE UPDATE ON bank_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_payments_updated_at();

-- Function to generate transaction hash
CREATE OR REPLACE FUNCTION generate_transaction_hash(
  p_date DATE,
  p_amount DECIMAL,
  p_account TEXT,
  p_reference TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN md5(
    COALESCE(p_date::TEXT, '') || 
    COALESCE(p_amount::TEXT, '') || 
    COALESCE(p_account, '') || 
    COALESCE(p_reference, '')
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
