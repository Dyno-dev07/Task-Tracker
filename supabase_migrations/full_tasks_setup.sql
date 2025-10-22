-- 1. Clean up existing elements (if they exist)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP FUNCTION IF EXISTS update_updated_at_column_tasks CASCADE; -- Use a distinct function name
DROP POLICY IF EXISTS "Users can view their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks." ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks." ON public.tasks;
DROP TABLE IF EXISTS public.tasks CASCADE;

-- 2. Create the tasks table
CREATE TABLE public.tasks (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'in-progress', 'completed'
  priority text DEFAULT 'medium' NOT NULL, -- e.g., 'low', 'medium', 'high'
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Define RLS Policies

-- Policy to allow users to view only their own tasks
CREATE POLICY "Users can view their own tasks." ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow authenticated users to create tasks, ensuring user_id matches auth.uid()
CREATE POLICY "Users can create their own tasks." ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own tasks
CREATE POLICY "Users can update their own tasks." ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete only their own tasks
CREATE POLICY "Users can delete their own tasks." ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create a function and trigger to automatically update the updated_at column
-- Using a distinct function name to avoid conflicts with other tables
CREATE OR REPLACE FUNCTION update_updated_at_column_tasks()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_tasks();

-- 6. Add the tasks table to the supabase_realtime publication (optional, but good practice)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;