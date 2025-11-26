-- Migration: Spiritual Exercises Registrations
-- Description: Table for storing user registrations for spiritual exercises
-- Created: 2025-11-26

-- ============================================================================
-- DROP EXISTING (if needed for re-run)
-- ============================================================================

DROP TABLE IF EXISTS spiritual_exercises_registrations CASCADE;

-- ============================================================================
-- CREATE TABLE: spiritual_exercises_registrations
-- ============================================================================

CREATE TABLE spiritual_exercises_registrations (
    id BIGSERIAL PRIMARY KEY,
    exercise_id BIGINT NOT NULL REFERENCES spiritual_exercises(id) ON DELETE CASCADE,
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    
    -- Personal Information
    birth_date DATE NOT NULL,
    id_card_number VARCHAR(50) NOT NULL,
    
    -- Address
    city VARCHAR(100) NOT NULL,
    street VARCHAR(200) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    
    -- Church Information
    parish VARCHAR(200),
    diocese VARCHAR(200),
    
    -- Accommodation
    room_type VARCHAR(100) NOT NULL, -- "1-lôžková izba", "2-lôžková izba", etc.
    dietary_restrictions TEXT,
    
    -- Additional Information
    notes TEXT,
    referral_source VARCHAR(200), -- "Z aplikácie Lectio divina", "Od známych", etc.
    
    -- GDPR Consents
    gdpr_consent BOOLEAN NOT NULL DEFAULT false,
    responsibility_consent BOOLEAN NOT NULL DEFAULT false,
    newsletter_consent BOOLEAN DEFAULT false,
    
    -- Payment Status
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, deposit_paid, fully_paid, cancelled
    payment_amount DECIMAL(10, 2), -- Total amount expected
    payment_notes TEXT,
    
    -- Metadata
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_by VARCHAR(50) DEFAULT 'web', -- web, admin, app
    
    -- Constraints
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'cancelled'))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_registrations_exercise_id ON spiritual_exercises_registrations(exercise_id);
CREATE INDEX idx_registrations_email ON spiritual_exercises_registrations(email);
CREATE INDEX idx_registrations_payment_status ON spiritual_exercises_registrations(payment_status);
CREATE INDEX idx_registrations_registration_date ON spiritual_exercises_registrations(registration_date DESC);
CREATE INDEX idx_registrations_phone ON spiritual_exercises_registrations(phone);

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_registrations_updated_at
    BEFORE UPDATE ON spiritual_exercises_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_registrations_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE spiritual_exercises_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Public can INSERT (register)
CREATE POLICY "Allow public registration"
    ON spiritual_exercises_registrations
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
    ON spiritual_exercises_registrations
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy: Admins can update registrations (payment status, notes)
CREATE POLICY "Admins can update registrations"
    ON spiritual_exercises_registrations
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy: Admins can delete registrations
CREATE POLICY "Admins can delete registrations"
    ON spiritual_exercises_registrations
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- This will be populated by actual user registrations

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE spiritual_exercises_registrations IS 'Stores user registrations for spiritual exercises with full contact, payment, and consent information';
COMMENT ON COLUMN spiritual_exercises_registrations.exercise_id IS 'Reference to the spiritual exercise';
COMMENT ON COLUMN spiritual_exercises_registrations.payment_status IS 'Current payment status: pending, deposit_paid, fully_paid, cancelled';
COMMENT ON COLUMN spiritual_exercises_registrations.room_type IS 'Selected room type - must match one from spiritual_exercises_pricing';
COMMENT ON COLUMN spiritual_exercises_registrations.gdpr_consent IS 'User confirmed GDPR consent';
COMMENT ON COLUMN spiritual_exercises_registrations.responsibility_consent IS 'User confirmed responsibility consent';
COMMENT ON COLUMN spiritual_exercises_registrations.registered_by IS 'Source of registration: web, admin, app';
