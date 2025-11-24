-- Enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Assuming "Allow authenticated users to select profiles" policy already exists.
-- If not, you would need to create it, but the error indicates it's there.
-- Example of what it should look like if it needed to be created:
-- CREATE POLICY "Allow authenticated users to select profiles"
-- ON profiles FOR SELECT
-- TO authenticated
-- USING (true);

-- Enable RLS on the tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy for tasks: Allow authenticated users to select their own tasks
CREATE POLICY "Allow authenticated users to select their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Policy for tasks: Allow users with 'Admin' role to select all tasks
CREATE POLICY "Admins can view all tasks"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
  )
);