-- Add a column to track if an event was bulk uploaded
ALTER TABLE public.events 
ADD COLUMN is_bulk_uploaded boolean DEFAULT false;