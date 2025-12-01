-- =====================================================
-- Create hour_logs table for volunteer hour tracking
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Create hour_logs table
CREATE TABLE IF NOT EXISTS hour_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  volunteer_id uuid NOT NULL,
  event_name text NOT NULL,
  hours numeric(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  verified_at timestamp with time zone,
  verified_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hour_logs_pkey PRIMARY KEY (id),
  CONSTRAINT hour_logs_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT hour_logs_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add comment to table
COMMENT ON TABLE hour_logs IS 'Stores volunteer hour submissions for approval';

-- Add comments to columns
COMMENT ON COLUMN hour_logs.volunteer_id IS 'ID of the volunteer who logged the hours';
COMMENT ON COLUMN hour_logs.event_name IS 'Name of the event or activity';
COMMENT ON COLUMN hour_logs.hours IS 'Number of hours worked (max 24 per entry)';
COMMENT ON COLUMN hour_logs.log_date IS 'Date when the volunteer work was performed';
COMMENT ON COLUMN hour_logs.description IS 'Optional description of activities performed';
COMMENT ON COLUMN hour_logs.verified_at IS 'Timestamp when admin approved the hours (null = pending)';
COMMENT ON COLUMN hour_logs.verified_by IS 'Admin user who verified the hours';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hour_logs_volunteer_id ON hour_logs(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_hour_logs_log_date ON hour_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_hour_logs_verified_at ON hour_logs(verified_at);
CREATE INDEX IF NOT EXISTS idx_hour_logs_volunteer_verified ON hour_logs(volunteer_id, verified_at);

-- Enable Row Level Security
ALTER TABLE hour_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Admins can view all hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Users can insert their own hour logs" ON hour_logs;
DROP POLICY IF EXISTS "Admins can manage all hour logs" ON hour_logs;

-- RLS Policies
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

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_hour_logs_updated_at ON hour_logs;
CREATE TRIGGER update_hour_logs_updated_at
  BEFORE UPDATE ON hour_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Setup Complete!
-- =====================================================
-- You can now:
-- 1. Volunteers can log hours in their dashboard
-- 2. Admins can approve/reject hours in /admin/hours
-- 3. Only approved hours count toward volunteer totals
-- =====================================================

