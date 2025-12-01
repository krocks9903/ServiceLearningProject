-- =====================================================
-- Recreate Shifts Table with All Required Columns
-- =====================================================
-- Run this in your Supabase SQL Editor to completely recreate the shifts table

-- 1. Drop the existing shifts table if it exists (this will also drop dependent objects)
DROP TABLE IF EXISTS shifts CASCADE;

-- 2. Create the shifts table with all required columns
CREATE TABLE shifts (
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

-- 3. Enable RLS for shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for shifts
-- Allow everyone to view shifts (for public event browsing)
CREATE POLICY "Anyone can view shifts"
  ON shifts FOR SELECT
  USING (true);

-- Allow admins to manage shifts
CREATE POLICY "Admins can manage shifts"
  ON shifts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Create volunteer_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  volunteer_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  event_id uuid NOT NULL,
  status text DEFAULT 'registered',
  hours_logged numeric(4,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  checked_in_at timestamp with time zone,
  checked_out_at timestamp with time zone,
  CONSTRAINT volunteer_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT volunteer_assignments_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT volunteer_assignments_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE CASCADE,
  CONSTRAINT volunteer_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  UNIQUE(volunteer_id, shift_id)
);

-- 6. Enable RLS for volunteer_assignments
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies for volunteer_assignments to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own assignments" ON volunteer_assignments;
DROP POLICY IF EXISTS "Users can create their own assignments" ON volunteer_assignments;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON volunteer_assignments;

-- 8. Create RLS policies for volunteer_assignments
-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON volunteer_assignments FOR SELECT
  USING (volunteer_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Users can create their own assignments
CREATE POLICY "Users can create their own assignments"
  ON volunteer_assignments FOR INSERT
  WITH CHECK (volunteer_id = auth.uid());

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
  ON volunteer_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shifts_event_id ON shifts(event_id);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts(start_time);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_volunteer_id ON volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_shift_id ON volunteer_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_event_id ON volunteer_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_status ON volunteer_assignments(status);

-- 10. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- 11. Test the setup
SELECT 'Shifts table recreated successfully' as status;
SELECT COUNT(*) as shifts_count FROM shifts;
SELECT COUNT(*) as assignments_count FROM volunteer_assignments;
