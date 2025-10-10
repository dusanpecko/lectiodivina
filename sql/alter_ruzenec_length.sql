-- Increase ruzenec field length from varchar(100) to varchar(150)
-- Date: 2025-10-10
-- Note: We need to drop and recreate the view that depends on this column

-- Step 1: Save the view definition (run this first to see the view definition)
SELECT pg_get_viewdef('lectio_divina_view', true);

-- Step 2: Drop the dependent view
DROP VIEW IF EXISTS lectio_divina_view CASCADE;

-- Step 3: Alter the column type
ALTER TABLE lectio_divina_ruzenec 
ALTER COLUMN ruzenec TYPE varchar(150);

-- Step 4: Recreate the view (you'll need to paste the view definition from Step 1 here)
-- CREATE OR REPLACE VIEW lectio_divina_view AS
-- [paste the view definition from Step 1 here]

-- Step 5: Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'lectio_divina_ruzenec' 
AND column_name = 'ruzenec';
