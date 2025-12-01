-- =====================================================
-- Add Missing Capacity Column to Shifts Table
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the capacity column issue

-- 1. Add capacity column to shifts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='shifts' AND column_name='capacity') THEN
    ALTER TABLE shifts ADD COLUMN capacity integer;
    RAISE NOTICE 'Added capacity column to shifts table';
  ELSE
    RAISE NOTICE 'Capacity column already exists in shifts table';
  END IF;
END $$;

-- 2. Add description column to shifts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='shifts' AND column_name='description') THEN
    ALTER TABLE shifts ADD COLUMN description text;
    RAISE NOTICE 'Added description column to shifts table';
  ELSE
    RAISE NOTICE 'Description column already exists in shifts table';
  END IF;
END $$;

-- 3. Add location column to shifts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='shifts' AND column_name='location') THEN
    ALTER TABLE shifts ADD COLUMN location text;
    RAISE NOTICE 'Added location column to shifts table';
  ELSE
    RAISE NOTICE 'Location column already exists in shifts table';
  END IF;
END $$;

-- 4. Verify the columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- 5. Test the fix
SELECT 'Shifts table columns updated successfully' as status;
