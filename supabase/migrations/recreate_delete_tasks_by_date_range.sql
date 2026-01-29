-- Drop the existing function if it exists, regardless of parameter types, to ensure a clean slate
DROP FUNCTION IF EXISTS public.delete_tasks_by_date_range(text, text);

-- Recreate the function with the correct parameter order
CREATE OR REPLACE FUNCTION public.delete_tasks_by_date_range(
    start_date_iso TEXT,
    end_date_iso TEXT
)
RETURNS VOID AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Check if the user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: No user logged in.';
    END IF;

    -- Get the role of the current user
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();

    -- Check if the user is an Admin
    IF user_role <> 'Admin' THEN
        RAISE EXCEPTION 'Permission Denied: Only administrators can delete tasks in bulk.';
    END IF;

    -- Perform the deletion
    DELETE FROM public.tasks
    WHERE created_at >= start_date_iso::TIMESTAMPTZ AND created_at <= end_date_iso::TIMESTAMPTZ;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;