CREATE OR REPLACE FUNCTION get_my_tasks_for_report(
    start_date_iso TEXT DEFAULT NULL,
    end_date_iso TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_id_param UUID := auth.uid();
BEGIN
    RETURN QUERY
    SELECT
        t.id::UUID,
        t.title::TEXT,
        t.description::TEXT,
        t.status::TEXT,
        t.priority::TEXT,
        t.due_date::TIMESTAMPTZ,
        t.created_at::TIMESTAMPTZ
    FROM
        tasks t
    WHERE
        t.user_id = user_id_param
        AND (start_date_iso IS NULL OR t.created_at >= start_date_iso::timestamptz)
        AND (end_date_iso IS NULL OR t.created_at <= end_date_iso::timestamptz)
    ORDER BY
        t.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_tasks_for_report(TEXT, TEXT) TO authenticated;