-- Drop existing overloaded functions to avoid "could not choose the best candidate function" error
-- We drop by name and argument types to be specific.
-- The error message indicates two possible signatures, so we'll drop both if they exist.
DROP FUNCTION IF EXISTS public.get_all_tasks_with_profiles(text, text, text, uuid, text, text);
DROP FUNCTION IF EXISTS public.get_all_tasks_with_profiles(uuid, text, text, text, text, text);

-- Create or replace the canonical function with a consistent parameter order
CREATE OR REPLACE FUNCTION public.get_all_tasks_with_profiles(
    user_id_filter uuid DEFAULT NULL,
    start_date_iso text DEFAULT NULL,
    end_date_iso text DEFAULT NULL,
    priority_filter text DEFAULT NULL,
    status_filter text DEFAULT NULL,
    department_name text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    status text,
    priority text,
    due_date timestamptz,
    created_at timestamptz,
    user_id uuid,
    remarks text,
    first_name text,
    department text
)
LANGUAGE plpgsql
AS $$
DECLARE
    _start_date timestamptz := NULL;
    _end_date timestamptz := NULL;
BEGIN
    IF start_date_iso IS NOT NULL THEN
        _start_date := start_date_iso::timestamptz;
    END IF;
    IF end_date_iso IS NOT NULL THEN
        _end_date := end_date_iso::timestamptz;
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
        t.remarks,
        p.first_name,
        p.department
    FROM
        public.tasks t
    JOIN
        public.profiles p ON t.user_id = p.id
    WHERE
        (user_id_filter IS NULL OR t.user_id = user_id_filter)
        AND (start_date_iso IS NULL OR t.created_at >= _start_date)
        AND (end_date_iso IS NULL OR t.created_at <= _end_date)
        AND (priority_filter IS NULL OR t.priority = priority_filter)
        AND (status_filter IS NULL OR t.status = status_filter)
        AND (department_name IS NULL OR p.department = department_name);
END;
$$;