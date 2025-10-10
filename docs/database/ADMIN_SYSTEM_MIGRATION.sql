-- Admin System Migration
-- Run this in your Supabase SQL Editor to add admin functionality

-- 1. Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'volunteer';
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('volunteer', 'admin'));
    END IF;
END $$;

-- 2. Create an admin user (replace with your email)
-- You can run this manually after creating your admin account
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 4. Update RLS policies to allow admins to see all profiles
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policies that allow admins to see all profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to insert new profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create a function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_volunteers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'volunteer'),
        'active_volunteers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'volunteer' AND status = 'active'),
        'pending_volunteers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'volunteer' AND status = 'pending'),
        'total_events', (SELECT COUNT(*) FROM public.events),
        'upcoming_events', (SELECT COUNT(*) FROM public.events WHERE start_date > NOW()),
        'total_hours', COALESCE((SELECT SUM(hours) FROM public.hour_logs WHERE verified_at IS NOT NULL), 0)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- 8. Create a view for volunteer summary (admin use)
CREATE OR REPLACE VIEW admin_volunteer_summary AS
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.status,
    p.created_at,
    COALESCE(SUM(hl.hours), 0) as total_hours,
    COUNT(DISTINCT va.event_id) as events_attended,
    MAX(hl.log_date) as last_volunteer_date
FROM public.profiles p
LEFT JOIN public.hour_logs hl ON p.id = hl.volunteer_id AND hl.verified_at IS NOT NULL
LEFT JOIN public.volunteer_assignments va ON p.id = va.volunteer_id AND va.status = 'completed'
WHERE p.role = 'volunteer'
GROUP BY p.id, p.email, p.first_name, p.last_name, p.phone, p.status, p.created_at;

-- Grant access to the view
GRANT SELECT ON admin_volunteer_summary TO authenticated;

-- 9. Verify the setup
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Show current admin users (if any)
SELECT email, first_name, last_name, role, status 
FROM public.profiles 
WHERE role = 'admin';
