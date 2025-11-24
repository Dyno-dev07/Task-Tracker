CREATE OR REPLACE FUNCTION get_all_tasks_with_profiles(
    user_id_filter uuid DEFAULT NULL,
    start_date_iso text DEFAULT NULL,
    end_date_iso text DEFAULT NULL,
    priority_filter text DEFAULT NULL,
    status_filter text DEFAULT NULL,
    department_name text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    description text,
    status text,
    priority text,
    due_date timestamptz,
    created_at timestamptz,
    remarks text,
    first_name text,
    department text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start_date timestamptz := NULL;
    v_end_date timestamptz := NULL;
BEGIN
    IF start_date_iso IS NOT NULL THEN
        v_start_date := start_date_iso::timestamptz;
    END IF;
    IF end_date_iso IS NOT NULL THEN
        v_end_date := end_date_iso::timestamptz;
    END IF;

    RETURN QUERY
    SELECT
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.remarks,
        p.first_name,
        p.department
    FROM
        tasks t
    JOIN
        profiles p ON t.user_id = p.id
    WHERE
        (user_id_filter IS NULL OR t.user_id = user_id_filter)
        AND (v_start_date IS NULL OR t.created_at >= v_start_date)
        AND (v_end_date IS NULL OR t.created_at <= v_end_date)
        AND (priority_filter IS NULL OR t.priority = priority_filter)
        AND (status_filter IS NULL OR t.status = status_filter)
        AND (department_name IS NULL OR p.department = department_name);
END;
$$;