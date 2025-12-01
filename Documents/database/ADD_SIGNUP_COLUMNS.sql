-- Add missing columns to profiles table for comprehensive volunteer registration
-- Run this in your Supabase SQL Editor

-- Check if columns exist and add them if they don't

-- Email (should already exist, but making sure)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
END $$;

-- First and Last Name (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name text NOT NULL DEFAULT '';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name text NOT NULL DEFAULT '';
    END IF;
END $$;

-- Phone and Emergency Contacts (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='emergency_contact_name') THEN
        ALTER TABLE public.profiles ADD COLUMN emergency_contact_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='emergency_contact_phone') THEN
        ALTER TABLE public.profiles ADD COLUMN emergency_contact_phone text;
    END IF;
END $$;

-- Date of Birth (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth date;
    END IF;
END $$;

-- Address (should already exist as jsonb)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='address') THEN
        ALTER TABLE public.profiles ADD COLUMN address jsonb;
    END IF;
END $$;

-- Skills (should already exist as array)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='skills') THEN
        ALTER TABLE public.profiles ADD COLUMN skills text[];
    END IF;
END $$;

-- Tags (should already exist as array)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='tags') THEN
        ALTER TABLE public.profiles ADD COLUMN tags text[];
    END IF;
END $$;

-- Status (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active';
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
            CHECK (status IN ('active', 'inactive', 'pending'));
    END IF;
END $$;

-- T-shirt size (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='t_shirt_size') THEN
        ALTER TABLE public.profiles ADD COLUMN t_shirt_size text;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_t_shirt_size_check 
            CHECK (t_shirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL'));
    END IF;
END $$;

-- Profile photo URL (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='profile_photo_url') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_photo_url text;
    END IF;
END $$;

-- Updated at timestamp (should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

