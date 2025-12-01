-- =====================================================
-- Test Shifts Table Structure
-- =====================================================
-- Run this in your Supabase SQL Editor to test the shifts table

-- 1. Check if shifts table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts') 
    THEN '✅ Shifts table exists'
    ELSE '❌ Shifts table does NOT exist'
  END as shifts_table_status;

-- 2. Check all columns in shifts table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- 3. Check if you have admin role
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

-- 4. Check if there are any events to create shifts for
SELECT 
  COUNT(*) as total_events,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Events exist'
    ELSE '❌ No events found - create an event first'
  END as events_status
FROM events;

-- 5. Test inserting a shift (this will show if there are any remaining issues)
-- First, get an event ID
SELECT id, title FROM events LIMIT 1;

-- If you have events, uncomment and run this test (replace the event_id with a real one):
-- INSERT INTO shifts (event_id, title, start_time, end_time) 
-- VALUES (
--   (SELECT id FROM events LIMIT 1), 
--   'Test Shift', 
--   now(), 
--   now() + interval '2 hours'
-- );
-- SELECT 'Test shift created successfully' as test_result;
