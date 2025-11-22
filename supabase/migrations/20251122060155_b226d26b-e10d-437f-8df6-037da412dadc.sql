-- Add custom email text field to events table
ALTER TABLE public.events
ADD COLUMN custom_email_text TEXT;