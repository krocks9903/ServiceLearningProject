-- =====================================================
-- Fix for Volunteer Assignments and Shifts Tables
-- =====================================================
-- This script creates the missing tables if they don't exist
-- Run this in your Supabase SQL Editor if shift registration is not working

-- Create shifts table if it doesn't exist
CREATE TABLE IF NOT EXISTS shifts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  capacity integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shifts_pkey PRIMARY KEY (id),
  CONSTRAINT shifts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- Enable RLS for shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shifts
DROP POLICY IF EXISTS "Anyone can view shifts" ON shifts;
DROP POLICY IF EXISTS "Admins can manage shifts" ON shifts;

CREATE POLICY "Anyone can view shifts"
  ON shifts FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shifts"
  ON shifts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create volunteer_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  volunteer_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  event_id uuid NOT NULL,
  status text DEFAULT 'registered',
  hours_logged numeric(4,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT volunteer_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT volunteer_assignments_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT volunteer_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE CASCADE,
  CONSTRAINT volunteer_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  UNIQUE(volunteer_id, shift_id)
);

-- Enable RLS
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own assignments" ON volunteer_assignments;
DROP POLICY IF EXISTS "Users can create their own assignments" ON volunteer_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON volunteer_assignments;

-- Volunteer assignments: Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON volunteer_assignments FOR SELECT
  USING (volunteer_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Volunteer assignments: Users can create their own assignments
CREATE POLICY "Users can create their own assignments"
  ON volunteer_assignments FOR INSERT
  WITH CHECK (volunteer_id = auth.uid());

-- Volunteer assignments: Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
  ON volunteer_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_volunteer_id 
  ON volunteer_assignments(volunteer_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_shift_id 
  ON volunteer_assignments(shift_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_event_id 
  ON volunteer_assignments(event_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shifts_event_id ON shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts(start_time);

-- Verify the tables were created
SELECT 'shifts table created successfully' as status
UNION ALL
SELECT 'volunteer_assignments table created successfully' as status;
