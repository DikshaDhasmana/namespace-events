-- Add minimum team size column to events table
ALTER TABLE public.events
ADD COLUMN min_team_size integer;