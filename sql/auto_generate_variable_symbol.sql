-- Auto-generate variable symbol for new users
-- Format: 77XXXXXX (starting from 77002900)

-- Create sequence for variable symbols
CREATE SEQUENCE IF NOT EXISTS variable_symbol_seq START WITH 2900;

-- Function to generate next variable symbol
CREATE OR REPLACE FUNCTION generate_variable_symbol()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  vs_candidate TEXT;
  vs_exists BOOLEAN;
BEGIN
  -- Loop until we find a unique variable symbol
  LOOP
    -- Get next number from sequence
    next_number := nextval('variable_symbol_seq');
    
    -- Format as 77XXXXXX (pad with zeros to 6 digits)
    vs_candidate := '77' || LPAD(next_number::TEXT, 6, '0');
    
    -- Check if this VS already exists
    SELECT EXISTS(
      SELECT 1 FROM users WHERE variable_symbol = vs_candidate
    ) INTO vs_exists;
    
    -- If unique, return it
    IF NOT vs_exists THEN
      RETURN vs_candidate;
    END IF;
    
    -- Otherwise, loop and try next number
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-assign variable symbol on user creation
CREATE OR REPLACE FUNCTION auto_assign_variable_symbol()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if variable_symbol is not already set
  IF NEW.variable_symbol IS NULL OR NEW.variable_symbol = '' THEN
    NEW.variable_symbol := generate_variable_symbol();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_auto_assign_variable_symbol ON users;
CREATE TRIGGER trigger_auto_assign_variable_symbol
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_variable_symbol();

-- Comments
COMMENT ON SEQUENCE variable_symbol_seq IS 'Sequence for generating unique variable symbols for users (format: 77XXXXXX)';
COMMENT ON FUNCTION generate_variable_symbol() IS 'Generates unique variable symbol in format 77XXXXXX starting from 77002900';
COMMENT ON FUNCTION auto_assign_variable_symbol() IS 'Trigger function to automatically assign variable symbol to new users';

-- NOTE: To assign VS to existing users, run: backfill_variable_symbols.sql
