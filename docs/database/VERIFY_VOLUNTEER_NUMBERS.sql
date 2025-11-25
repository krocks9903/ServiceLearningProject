-- =====================================================
-- Verify and Fix Volunteer Numbers
-- =====================================================
-- Run this to check if volunteer numbers exist and are properly formatted

-- Check which volunteers have volunteer numbers
SELECT 
    id,
    email,
    first_name,
    last_name,
    volunteer_number,
    status,
    created_at
FROM profiles
WHERE volunteer_number IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;

-- Check which volunteers DON'T have volunteer numbers
SELECT 
    id,
    email,
    first_name,
    last_name,
    status,
    created_at
FROM profiles
WHERE volunteer_number IS NULL OR volunteer_number = ''
ORDER BY created_at DESC;

-- Generate volunteer numbers for any volunteers that don't have one
DO $$
DECLARE
    v_profile RECORD;
    v_number text;
    v_counter integer;
    v_date_prefix text;
BEGIN
    FOR v_profile IN 
        SELECT id, created_at 
        FROM profiles 
        WHERE volunteer_number IS NULL OR volunteer_number = ''
    LOOP
        -- Use the volunteer's created_at date for the number
        v_date_prefix := 'V-' || TO_CHAR(v_profile.created_at, 'YYYYMMDD') || '-';
        
        -- Find the next available number for that date
        SELECT COALESCE(MAX(CAST(SUBSTRING(volunteer_number FROM '-\d+$') AS INTEGER)), 0) + 1
        INTO v_counter
        FROM profiles
        WHERE volunteer_number LIKE v_date_prefix || '%';
        
        -- Generate the volunteer number
        v_number := v_date_prefix || LPAD(v_counter::text, 4, '0');
        
        -- Update the profile
        UPDATE profiles
        SET volunteer_number = v_number
        WHERE id = v_profile.id;
        
        RAISE NOTICE 'Assigned volunteer number % to volunteer %', v_number, v_profile.id;
    END LOOP;
END $$;

-- Verify a specific volunteer number exists
SELECT 
    id,
    email,
    first_name,
    last_name,
    volunteer_number,
    status
FROM profiles
WHERE volunteer_number = 'V-20251125-0001';

-- Check all volunteer numbers for a specific date
SELECT 
    volunteer_number,
    email,
    first_name,
    last_name
FROM profiles
WHERE volunteer_number LIKE 'V-20251125-%'
ORDER BY volunteer_number;

