-- Add foreign key constraint to the tasks table
ALTER TABLE tasks
ADD CONSTRAINT tasks_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to select profiles
CREATE POLICY "Allow authenticated users to select profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);