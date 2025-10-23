-- Create the announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_visible boolean NOT NULL DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) for the announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to read visible announcements
CREATE POLICY "Allow authenticated users to read visible announcements"
ON public.announcements FOR SELECT
USING (is_visible = TRUE);

-- Policy for admins to read all announcements (visible or not)
CREATE POLICY "Allow admins to read all announcements"
ON public.announcements FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Policy for admins to insert announcements
CREATE POLICY "Allow admins to insert announcements"
ON public.announcements FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Policy for admins to update announcements
CREATE POLICY "Allow admins to update announcements"
ON public.announcements FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Policy for admins to delete announcements
CREATE POLICY "Allow admins to delete announcements"
ON public.announcements FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Create a trigger to update the 'updated_at' column on each update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default data deletion reminder announcement
INSERT INTO public.announcements (content, is_visible)
VALUES (
  'Please be aware that all task data will be permanently deleted on the first Saturday of every month. Ensure you download any critical reports before this date.',
  TRUE
);