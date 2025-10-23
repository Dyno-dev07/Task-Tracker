-- Drop existing policies to avoid conflicts before creating new ones
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks; -- This policy is being removed
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;

-- Re-create policies for profiles table (these are fine as is)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Policy for tasks table: ONLY allow users to view their own tasks by default
-- This policy will now apply to ALL authenticated users, including Admins,
-- when they query the 'tasks' table directly.
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy for users to insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own tasks
CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy for users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);


-- RPC Function: get_all_tasks
-- Allows an admin to fetch all tasks, bypassing RLS.
CREATE OR REPLACE FUNCTION public.get_all_tasks()
RETURNS SETOF public.tasks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure only admins can call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can view all tasks.';
  END IF;
  RETURN QUERY SELECT * FROM public.tasks ORDER BY created_at DESC;
END;
$$;

-- RPC Function: get_all_task_counts
-- Allows an admin to get aggregate counts of all tasks, bypassing RLS.
CREATE OR REPLACE FUNCTION public.get_all_task_counts()
RETURNS TABLE(total_tasks bigint, pending_tasks bigint, in_progress_tasks bigint, completed_tasks bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ensure only admins can call this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Only administrators can view task summary.';
  END IF;
  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint AS pending_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress')::bigint AS in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::bigint AS completed_tasks
  FROM public.tasks;
END;
$$;

-- RPC Function: get_all_tasks_with_profiles
-- Allows an admin to fetch all tasks with associated profile info, with filters, bypassing RLS.
CREATE OR REPLACE FUNCTION public.get_all_tasks_with_profiles(
    start_date_iso text DEFAULT NULL,
    end_date_iso text DEFAULT NULL,
    department_name text DEFAULT NULL,
    user_id_filter uuid DEFAULT NULL,
    priority_filter text DEFAULT NULL,
    status_filter text DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    title text,
    description text,
    status text,
    priority text,
    due_date timestamptz,
    created_at timestamptz,
    user_id uuid,
    first_name text,
    department text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_date timestamptz := NULL;
    v_end_date timestamptz := NULL;
BEGIN
    -- Ensure only admins can call this function
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied: Only administrators can generate reports.';
    END IF;

    IF start_date_iso IS NOT NULL THEN
        v_start_date := start_date_iso::timestamptz;
    END IF;
    IF end_date_iso IS NOT NULL THEN
        v_end_date := end_date_iso::timestamptz;
    END IF;

    RETURN QUERY
    SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.user_id,
        p.first_name,
        p.department
    FROM
        public.tasks t
    JOIN
        public.profiles p ON t.user_id = p.id
    WHERE
        (v_start_date IS NULL OR t.created_at >= v_start_date) AND
        (v_end_date IS NULL OR t.created_at <= v_end_date) AND
        (department_name IS NULL OR p.department = department_name) AND
        (user_id_filter IS NULL OR t.user_id = user_id_filter) AND
        (priority_filter IS NULL OR t.priority = priority_filter::public.priority_enum) AND -- Cast to enum type
        (status_filter IS NULL OR t.status = status_filter::public.status_enum) -- Cast to enum type
    ORDER BY
        t.created_at DESC;
END;
$$;

-- Grant execute permissions on the new functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_tasks() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_task_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_tasks_with_profiles(text, text, text, uuid, text, text) TO authenticated;

-- Ensure the 'is_admin' function also has execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;