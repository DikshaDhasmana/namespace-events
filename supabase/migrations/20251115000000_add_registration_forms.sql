-- Add registration_form_id to events table
ALTER TABLE public.events
ADD COLUMN registration_form_id uuid REFERENCES public.forms(id) ON DELETE SET NULL;

-- Add form_submission_id to registrations table
ALTER TABLE public.registrations
ADD COLUMN form_submission_id uuid REFERENCES public.form_submissions(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_events_registration_form_id ON public.events(registration_form_id);
CREATE INDEX idx_registrations_form_submission_id ON public.registrations(form_submission_id);

-- Add comment to explain the columns
COMMENT ON COLUMN public.events.registration_form_id IS 'References the form that users must fill when registering for this event';
COMMENT ON COLUMN public.registrations.form_submission_id IS 'References the form submission data for this registration';
