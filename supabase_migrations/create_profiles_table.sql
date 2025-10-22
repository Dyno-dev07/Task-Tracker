-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name text,
  department text,
  role text DEFAULT 'Regular'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to create their own profile
CREATE POLICY "Users can create their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Set up Realtime for the profiles table (optional, but good practice)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;