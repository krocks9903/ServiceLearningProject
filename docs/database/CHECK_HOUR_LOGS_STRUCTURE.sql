-- =====================================================
-- Check the actual structure of hour_logs table
-- =====================================================
-- Run this in Supabase SQL Editor to see what columns exist

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'hour_logs' 
ORDER BY ordinal_position;







