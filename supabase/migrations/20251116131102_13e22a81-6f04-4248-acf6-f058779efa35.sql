-- Add is_event_form flag to forms table to distinguish event forms from standalone forms
ALTER TABLE public.forms ADD COLUMN is_event_form boolean DEFAULT false;

-- Update existing event forms to mark them as event forms
UPDATE public.forms 
SET is_event_form = true 
WHERE id IN (SELECT registration_form_id FROM public.events WHERE registration_form_id IS NOT NULL);