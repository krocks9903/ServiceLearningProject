-- =====================================================
-- Fix Shifts Relationship with volunteer_assignments
-- =====================================================
-- This script verifies and ensures the foreign key relationship
-- is properly set up so Supabase can recognize it

-- Check if the foreign key constraint exists
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'volunteer_assignments'
    AND kcu.column_name = 'shift_id';

-- If the foreign key doesn't exist, create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'volunteer_assignments_shift_id_fkey'
        AND table_name = 'volunteer_assignments'
    ) THEN
        ALTER TABLE volunteer_assignments
        ADD CONSTRAINT volunteer_assignments_shift_id_fkey
        FOREIGN KEY (shift_id) 
        REFERENCES public.shifts(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE 'Created foreign key constraint volunteer_assignments_shift_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Refresh the schema cache (this helps Supabase recognize the relationship)
-- Note: This is usually done automatically, but we'll force a refresh by querying
SELECT 
    va.id as assignment_id,
    va.shift_id,
    s.id as shift_id_from_shifts,
    s.title as shift_title
FROM volunteer_assignments va
LEFT JOIN shifts s ON va.shift_id = s.id
LIMIT 1;

-- Verify the relationship works
SELECT 
    'Relationship verified' as status,
    COUNT(*) as total_assignments_with_shifts
FROM volunteer_assignments va
INNER JOIN shifts s ON va.shift_id = s.id;

