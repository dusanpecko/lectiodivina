-- Create table to track imported XML bank statements
-- Prevents duplicate imports of the same XML file

CREATE TABLE IF NOT EXISTS bank_statement_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Unique identifier from XML file (Message ID)
  message_id TEXT NOT NULL UNIQUE,
  
  -- Statement metadata
  statement_id TEXT,
  account_iban TEXT,
  statement_date_from DATE,
  statement_date_to DATE,
  
  -- Import details
  file_name TEXT NOT NULL,
  file_size INTEGER,
  payments_count INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  
  -- Admin who imported
  imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bank_statement_imports_message_id 
  ON bank_statement_imports(message_id);

CREATE INDEX IF NOT EXISTS idx_bank_statement_imports_imported_at 
  ON bank_statement_imports(imported_at DESC);

-- RLS policies
ALTER TABLE bank_statement_imports ENABLE ROW LEVEL SECURITY;

-- Admin can see all imports
CREATE POLICY "Admin can view all bank statement imports"
  ON bank_statement_imports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin can insert imports
CREATE POLICY "Admin can insert bank statement imports"
  ON bank_statement_imports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

COMMENT ON TABLE bank_statement_imports IS 'Tracks imported XML bank statements to prevent duplicates';
COMMENT ON COLUMN bank_statement_imports.message_id IS 'Unique Message ID from XML file header (GrpHdr.MsgId)';
COMMENT ON COLUMN bank_statement_imports.statement_id IS 'Statement ID from XML (Stmt.Id)';
