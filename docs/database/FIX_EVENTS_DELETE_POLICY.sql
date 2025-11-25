-- =====================================================
-- Fix Events Table DELETE Policy for Admins
-- =====================================================
-- This script ensures admins can delete events
-- Run this in your Supabase SQL Editor

-- Check if events table has RLS enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'events'
  ) THEN
    RAISE EXCEPTION 'Events table does not exist';
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing DELETE policies if they exist
DROP POLICY IF EXISTS "Admins can delete events" ON events;
DROP POLICY IF EXISTS "Anyone can delete events" ON events;

-- Create a function to check admin status (if it doesn't exist)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Create DELETE policy for admins
CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (is_admin());

-- Also ensure admins can do all operations on events
DROP POLICY IF EXISTS "Admins can manage events" ON events;

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Verify the policies
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
WHERE tablename = 'events'
ORDER BY policyname;

