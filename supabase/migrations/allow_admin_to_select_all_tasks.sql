-- Enable RLS on the tasks table if not already enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users with the 'Admin' role to select all tasks
CREATE POLICY "Admins can view all tasks"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
  )
);