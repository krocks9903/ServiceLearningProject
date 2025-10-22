-- =====================================================
-- Diagnose Shift Creation Issues
-- =====================================================
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check if shifts table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts') 
    THEN '✅ Shifts table exists'
    ELSE '❌ Shifts table does NOT exist'
  END as shifts_table_status;

-- 2. Check if volunteer_assignments table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'volunteer_assignments') 
    THEN '✅ Volunteer_assignments table exists'
    ELSE '❌ Volunteer_assignments table does NOT exist'
  END as assignments_table_status;

-- 3. Check shifts table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- 4. Check RLS policies on shifts table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'shifts';

-- 5. Check if you have admin role
SELECT 
  id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ You are an admin'
    ELSE '❌ You are NOT an admin - role: ' || COALESCE(role, 'NULL')
  END as admin_status
FROM profiles 
WHERE id = auth.uid();

-- 6. Check if there are any events to create shifts for
SELECT 
  COUNT(*) as total_events,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Events exist'
    ELSE '❌ No events found - create an event first'
  END as events_status
FROM events;

-- 7. Test if you can insert into shifts (this will show the exact error)
-- Uncomment the line below to test actual insertion
-- INSERT INTO shifts (event_id, title, start_time, end_time) VALUES ('00000000-0000-0000-0000-000000000000', 'Test Shift', now(), now() + interval '2 hours');

-- 8. Check current user permissions
SELECT 
  current_user as database_user,
  session_user as session_user,
  current_setting('role') as current_role;
