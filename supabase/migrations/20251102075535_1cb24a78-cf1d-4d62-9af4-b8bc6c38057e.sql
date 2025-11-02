-- Add new columns to events table for hackathon dynamic fields
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS timeline jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS prizes_and_tracks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS judges_and_mentors jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.events.timeline IS 'Array of timeline entries with label and datetime';
COMMENT ON COLUMN public.events.prizes_and_tracks IS 'Array of prizes/tracks with title and description';
COMMENT ON COLUMN public.events.judges_and_mentors IS 'Array of judges/mentors with name, role, and bio';