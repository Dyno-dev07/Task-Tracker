-- Add created_at column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN created_at timestamp with time zone DEFAULT now() NOT NULL;

-- Add updated_at column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- Create a function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function before each update on the profiles table
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();