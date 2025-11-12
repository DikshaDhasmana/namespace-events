-- Add profile_field column to form_fields table
ALTER TABLE public.form_fields
ADD COLUMN profile_field text;

-- Add comment to explain the column
COMMENT ON COLUMN public.form_fields.profile_field IS 'Maps the form field to a user profile column name for automatic pre-filling and updates';
