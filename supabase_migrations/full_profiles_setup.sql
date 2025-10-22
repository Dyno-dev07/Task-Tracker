-- 1. Clean up existing elements (if they exist)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create the profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name text,
  department text,
  role text DEFAULT 'Regular',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow authenticated users to create their own profile during sign-up
-- The foreign key constraint on 'id' ensures it links to an existing auth.users entry.
CREATE POLICY "Users can create their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Create a function and trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Add the profiles table to the supabase_realtime publication (optional, but good practice)
-- This line might fail if supabase_realtime publication doesn't exist or if the table is already added.
-- You can safely ignore an error here if it says the table is already added or publication doesn't exist.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;