-- =====================================================
-- Add Admin Features: Volunteer Numbers, Private Events, Manual Hours
-- =====================================================
-- This script adds the necessary database changes for:
-- 1. Volunteer numbers for on-site sign-in
-- 2. Private events for corporate/special groups
-- 3. Support for manual hour adjustments
-- =====================================================

-- =====================================================
-- 1. ADD VOLUNTEER NUMBER TO PROFILES
-- =====================================================

-- Add volunteer_number column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='volunteer_number') THEN
    ALTER TABLE profiles ADD COLUMN volunteer_number text UNIQUE;
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_volunteer_number ON profiles(volunteer_number);
    
    -- Generate volunteer numbers for existing volunteers
    -- Format: V-YYYYMMDD-XXXX (e.g., V-20250115-0001)
    -- Use a subquery to handle window functions in UPDATE
    UPDATE profiles p
    SET volunteer_number = 'V-' || TO_CHAR(p.created_at, 'YYYYMMDD') || '-' || 
        LPAD((subq.row_num)::text, 4, '0')
    FROM (
      SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at) as row_num
      FROM profiles
      WHERE volunteer_number IS NULL
    ) subq
    WHERE p.id = subq.id AND p.volunteer_number IS NULL;
    
    RAISE NOTICE 'Added volunteer_number column to profiles table';
  ELSE
    RAISE NOTICE 'volunteer_number column already exists in profiles table';
  END IF;
END $$;

-- Function to auto-generate volunteer number on insert
CREATE OR REPLACE FUNCTION generate_volunteer_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- If volunteer_number is already set, don't override
  IF NEW.volunteer_number IS NOT NULL AND NEW.volunteer_number != '' THEN
    RETURN NEW;
  END IF;
  
  -- Generate format: V-YYYYMMDD-XXXX
  new_number := 'V-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  -- Find the next available number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(volunteer_number FROM '-\d+$') AS INTEGER)), 0) + 1
  INTO counter
  FROM profiles
  WHERE volunteer_number LIKE new_number || '%';
  
  -- Set the volunteer number
  NEW.volunteer_number := new_number || LPAD(counter::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate volunteer numbers
DROP TRIGGER IF EXISTS generate_volunteer_number_trigger ON profiles;
CREATE TRIGGER generate_volunteer_number_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_volunteer_number();

-- =====================================================
-- 2. ADD PRIVATE EVENT SUPPORT
-- =====================================================

-- Add is_private column to events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='events' AND column_name='is_private') THEN
    ALTER TABLE events ADD COLUMN is_private boolean DEFAULT false;
    RAISE NOTICE 'Added is_private column to events table';
  ELSE
    RAISE NOTICE 'is_private column already exists in events table';
  END IF;
END $$;

-- Create table for event visibility (which volunteers/groups can see private events)
CREATE TABLE IF NOT EXISTS event_visibility (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  volunteer_id uuid,
  group_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_visibility_pkey PRIMARY KEY (id),
  CONSTRAINT event_visibility_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  CONSTRAINT event_visibility_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT event_visibility_group_id_fkey FOREIGN KEY (group_id) REFERENCES volunteer_groups(id) ON DELETE CASCADE,
  CONSTRAINT event_visibility_check CHECK (
    (volunteer_id IS NOT NULL AND group_id IS NULL) OR 
    (volunteer_id IS NULL AND group_id IS NOT NULL)
  )
);

-- Create indexes for event_visibility
CREATE INDEX IF NOT EXISTS idx_event_visibility_event_id ON event_visibility(event_id);
CREATE INDEX IF NOT EXISTS idx_event_visibility_volunteer_id ON event_visibility(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_event_visibility_group_id ON event_visibility(group_id);

-- Enable RLS for event_visibility
ALTER TABLE event_visibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_visibility
DROP POLICY IF EXISTS "Admins can manage event visibility" ON event_visibility;
DROP POLICY IF EXISTS "Volunteers can view their own event visibility" ON event_visibility;

CREATE POLICY "Admins can manage event visibility"
  ON event_visibility FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Volunteers can view their own event visibility"
  ON event_visibility FOR SELECT
  USING (
    volunteer_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM volunteer_group_memberships
      WHERE volunteer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 3. ADD CHECK-IN/CHECK-OUT TIMESTAMPS TO VOLUNTEER_ASSIGNMENTS
-- =====================================================

-- Add check-in/check-out timestamps if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='volunteer_assignments' AND column_name='checked_in_at') THEN
    ALTER TABLE volunteer_assignments ADD COLUMN checked_in_at timestamp with time zone;
    RAISE NOTICE 'Added checked_in_at column to volunteer_assignments table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='volunteer_assignments' AND column_name='checked_out_at') THEN
    ALTER TABLE volunteer_assignments ADD COLUMN checked_out_at timestamp with time zone;
    RAISE NOTICE 'Added checked_out_at column to volunteer_assignments table';
  END IF;
END $$;

-- =====================================================
-- 4. ADD ADMIN NOTES TO HOUR_LOGS FOR MANUAL ADJUSTMENTS
-- =====================================================

-- Add admin_notes column to hour_logs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='admin_notes') THEN
    ALTER TABLE hour_logs ADD COLUMN admin_notes text;
    RAISE NOTICE 'Added admin_notes column to hour_logs table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='added_by_admin') THEN
    ALTER TABLE hour_logs ADD COLUMN added_by_admin boolean DEFAULT false;
    RAISE NOTICE 'Added added_by_admin column to hour_logs table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hour_logs' AND column_name='admin_id') THEN
    ALTER TABLE hour_logs ADD COLUMN admin_id uuid;
    ALTER TABLE hour_logs ADD CONSTRAINT hour_logs_admin_id_fkey 
      FOREIGN KEY (admin_id) REFERENCES public.profiles(id);
    RAISE NOTICE 'Added admin_id column to hour_logs table';
  END IF;
END $$;

-- =====================================================
-- 5. CREATE FUNCTION TO CALCULATE HOURS FROM CHECK-IN/OUT
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_hours_from_checkin(
  p_assignment_id uuid
)
RETURNS numeric AS $$
DECLARE
  v_hours numeric;
  v_checked_in timestamp with time zone;
  v_checked_out timestamp with time zone;
BEGIN
  SELECT checked_in_at, checked_out_at
  INTO v_checked_in, v_checked_out
  FROM volunteer_assignments
  WHERE id = p_assignment_id;
  
  IF v_checked_in IS NULL OR v_checked_out IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate hours difference
  v_hours := EXTRACT(EPOCH FROM (v_checked_out - v_checked_in)) / 3600.0;
  
  RETURN ROUND(v_hours, 2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Ensure admins can view all volunteer numbers
-- (This is handled by existing RLS policies, but we ensure it's clear)

COMMENT ON COLUMN profiles.volunteer_number IS 'Unique volunteer number for on-site sign-in (format: V-YYYYMMDD-XXXX)';
COMMENT ON COLUMN events.is_private IS 'If true, event is only visible to selected volunteers/groups';
COMMENT ON COLUMN event_visibility.volunteer_id IS 'Specific volunteer who can see this private event';
COMMENT ON COLUMN event_visibility.group_id IS 'Group whose members can see this private event';
COMMENT ON COLUMN hour_logs.added_by_admin IS 'True if hours were manually added by an admin';
COMMENT ON COLUMN hour_logs.admin_notes IS 'Notes from admin about manual hour adjustments';

