-- Add confirmation_email_enabled field to events table
ALTER TABLE public.events 
ADD COLUMN confirmation_email_enabled boolean DEFAULT true;

COMMENT ON COLUMN public.events.confirmation_email_enabled IS 'Whether to send confirmation emails to applicants for this event';