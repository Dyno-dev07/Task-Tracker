-- Enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to select profiles
-- This policy ensures that any authenticated user can read any profile.
-- If you need more granular control (e.g., users can only read their own profile),
-- this policy would need to be adjusted. For fetching user names in task lists,
-- allowing all authenticated users to select profiles is typically required.
CREATE POLICY "Allow authenticated users to select profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);