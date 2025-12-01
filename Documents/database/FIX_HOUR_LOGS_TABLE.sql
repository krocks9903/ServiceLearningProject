-- =====================================================
-- Fix hour_logs table to match the application needs
-- =====================================================
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'hour_logs' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='description') THEN
    ALTER TABLE hour_logs ADD COLUMN description text;
  END IF;
  
  -- Add verified_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='verified_at') THEN
    ALTER TABLE hour_logs ADD COLUMN verified_at timestamp with time zone;
  END IF;
  
  -- Add verified_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='verified_by') THEN
    ALTER TABLE hour_logs ADD COLUMN verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='updated_at') THEN
    ALTER TABLE hour_logs ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE hour_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Admins can view all hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Users can insert their own hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Admins can manage all hour logs" ON hour_logs;

-- Create RLS policies
-- Users can view their own hour logs
CREATE POLICY "Users can view their own hour logs"
  ON hour_logs FOR SELECT
  USING (
    volunteer_id = auth.uid() 
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Users can insert their own hour logs
CREATE POLICY "Users can insert their own hour logs"
  ON hour_logs FOR INSERT
  WITH CHECK (volunteer_id = auth.uid());

-- Admins can update and delete hour logs (for approval/rejection)
CREATE POLICY "Admins can manage all hour logs"
  ON hour_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hour_logs_volunteer_id ON hour_logs(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_hour_logs_log_date ON hour_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_hour_logs_verified_at ON hour_logs(verified_at);
CREATE INDEX IF NOT EXISTS idx_hour_logs_volunteer_verified ON hour_logs(volunteer_id, verified_at);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_hour_logs_updated_at ON hour_logs;
CREATE TRIGGER update_hour_logs_updated_at
  BEFORE UPDATE ON hour_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Your hour_logs table should now have:
-- ✅ volunteer_id (uuid)
-- ✅ hours (numeric)
-- ✅ log_date (date)
-- ✅ description (text, optional)
-- ✅ verified_at (timestamp, null = pending)
-- ✅ verified_by (uuid, admin who approved)
-- ✅ created_at (timestamp)
-- ✅ updated_at (timestamp)
-- ✅ Proper RLS policies
-- ✅ Performance indexes
-- =====================================================
