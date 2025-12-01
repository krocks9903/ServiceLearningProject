-- Fix RLS Policies - Remove infinite recursion
-- Run this in your Supabase SQL Editor to fix the policies

-- 1. Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- 2. Create simple, non-recursive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create admin-specific policies using the function
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (is_admin());

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (is_admin());

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (is_admin());

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- 6. Test the policies
SELECT 
    'Policies created successfully' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'profiles';
