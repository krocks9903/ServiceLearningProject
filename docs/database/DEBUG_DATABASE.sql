-- Debug script to check database structure
-- Run this in Supabase SQL Editor to diagnose volunteer assignments issue

-- Check if volunteer_assignments table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'volunteer_assignments'
ORDER BY ordinal_position;

-- Check if shifts table exists and what columns it has
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- Check if shifts table has any data
SELECT COUNT(*) as total_shifts FROM shifts;

-- Show sample shifts data
SELECT * FROM shifts LIMIT 3;

-- Check if profiles table exists
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies on volunteer_assignments
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'volunteer_assignments';

-- Check if there are any volunteer_assignments records
SELECT COUNT(*) as total_assignments FROM volunteer_assignments;

-- Check if there are any shifts
SELECT COUNT(*) as total_shifts FROM shifts;

-- Check if there are any profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test a simple join query
SELECT 
  va.id,
  va.event_id,
  va.volunteer_id,
  va.shift_id,
  va.status
FROM volunteer_assignments va
LIMIT 5;
