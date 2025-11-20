-- Add registration start and end times to events table
ALTER TABLE public.events 
ADD COLUMN registration_start timestamp with time zone,
ADD COLUMN registration_end timestamp with time zone;

-- Add a check constraint to ensure registration_end is not after event end_date
ALTER TABLE public.events 
ADD CONSTRAINT registration_end_before_event_end 
CHECK (registration_end IS NULL OR end_date IS NULL OR registration_end <= end_date);

COMMENT ON COLUMN public.events.registration_start IS 'When registration opens for the event';
COMMENT ON COLUMN public.events.registration_end IS 'When registration closes for the event';