-- Drop the existing policy for creating profiles
DROP POLICY IF EXISTS "Users can create their own profile." ON public.profiles;

-- Create a new policy to allow authenticated users to create their profile
-- The foreign key constraint on 'id' will ensure it links to an existing auth.users entry.
CREATE POLICY "Users can create their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');