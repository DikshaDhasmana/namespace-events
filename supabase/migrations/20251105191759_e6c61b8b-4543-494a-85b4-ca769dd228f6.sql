-- Create function to validate unique team names for hackathons only
CREATE OR REPLACE FUNCTION public.validate_unique_team_name_for_hackathons()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_type text;
BEGIN
  -- Get the event type
  SELECT event_type INTO v_event_type
  FROM public.events
  WHERE id = NEW.event_id;
  
  -- Only enforce uniqueness for hackathons
  IF v_event_type = 'hackathon' THEN
    -- Check if a team with the same name already exists for this hackathon
    IF EXISTS (
      SELECT 1 FROM public.teams
      WHERE event_id = NEW.event_id
      AND name = NEW.name
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'A team with this name already exists for this hackathon';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce unique team names for hackathons
CREATE TRIGGER validate_team_name_uniqueness
BEFORE INSERT OR UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.validate_unique_team_name_for_hackathons();