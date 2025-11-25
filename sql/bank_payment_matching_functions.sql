-- Function to automatically match bank payments with users by variable symbol
-- This function is called after importing bank payments
-- Skips already matched payments for performance

-- Drop old function first (to allow changing return type)
DROP FUNCTION IF EXISTS match_bank_payments_by_vs();

CREATE OR REPLACE FUNCTION match_bank_payments_by_vs()
RETURNS TABLE (
  matched_count INTEGER,
  unmatched_count INTEGER,
  skipped_count INTEGER
) AS $$
DECLARE
  v_matched INTEGER := 0;
  v_unmatched INTEGER := 0;
  v_skipped INTEGER := 0;
BEGIN
  -- Count already matched payments (will be skipped)
  SELECT COUNT(*) INTO v_skipped
  FROM bank_payments
  WHERE matched = true;
  
  -- Match payments where VS exists in payer_reference and matches user's variable_symbol
  -- Only match payments that are not already matched (performance optimization)
  UPDATE bank_payments bp
  SET 
    user_id = u.id,
    matched = true,
    matched_at = NOW()
  FROM users u
  WHERE 
    bp.matched = false
    AND u.variable_symbol IS NOT NULL
    AND u.variable_symbol != ''
    AND bp.payer_reference LIKE '%' || u.variable_symbol || '%';
  
  GET DIAGNOSTICS v_matched = ROW_COUNT;
  
  -- Count remaining unmatched payments
  SELECT COUNT(*) INTO v_unmatched
  FROM bank_payments
  WHERE matched = false;
  
  RETURN QUERY SELECT v_matched, v_unmatched, v_skipped;
END;
$$ LANGUAGE plpgsql;

-- Function to match a specific payment manually by admin
CREATE OR REPLACE FUNCTION match_bank_payment_manual(
  p_payment_id UUID,
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bank_payments
  SET 
    user_id = p_user_id,
    matched = true,
    matched_at = NOW(),
    matched_by = p_admin_id
  WHERE id = p_payment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to unmatch a payment
CREATE OR REPLACE FUNCTION unmatch_bank_payment(
  p_payment_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE bank_payments
  SET 
    user_id = NULL,
    matched = false,
    matched_at = NULL,
    matched_by = NULL
  WHERE id = p_payment_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically match payments after insert
CREATE OR REPLACE FUNCTION auto_match_bank_payment_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to find matching user by variable symbol
  IF NEW.matched = false AND NEW.payer_reference IS NOT NULL THEN
    UPDATE bank_payments bp
    SET 
      user_id = u.id,
      matched = true,
      matched_at = NOW()
    FROM users u
    WHERE 
      bp.id = NEW.id
      AND u.variable_symbol IS NOT NULL
      AND u.variable_symbol != ''
      AND NEW.payer_reference LIKE '%' || u.variable_symbol || '%';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_match_bank_payment ON bank_payments;
CREATE TRIGGER trigger_auto_match_bank_payment
  AFTER INSERT ON bank_payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_match_bank_payment_trigger();
