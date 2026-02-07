-- Migration: Fix user trigger to map profile fields from metadata
-- Date: 2026-02-08

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, date_of_birth, gender, location)
  VALUES (
    new.id, 
    new.email, 
    -- Map display_name to full_name (or fall back to full_name in metadata)
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'avatar_url',
    -- Cast date string to DATE type. Ensure input is YYYY-MM-DD.
    (new.raw_user_meta_data->>'date_of_birth')::DATE,
    -- Gender is not currently collected in signup form, so it will be NULL or default
    NULL, 
    -- Map zip_code to location
    new.raw_user_meta_data->>'zip_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger to be sure (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
