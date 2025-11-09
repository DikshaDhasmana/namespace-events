-- Function to handle unregistration cascade deletes
CREATE OR REPLACE FUNCTION public.handle_unregistration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_team_id UUID;
  v_team_member_count INTEGER;
BEGIN
  -- Get user's team for this event
  SELECT tm.team_id INTO v_team_id
  FROM public.team_members tm
  JOIN public.teams t ON t.id = tm.team_id
  WHERE tm.user_id = OLD.user_id
  AND t.event_id = OLD.event_id;
  
  -- Remove from team if they're in one
  IF v_team_id IS NOT NULL THEN
    -- Delete team membership (this will trigger project_members removal via existing trigger)
    DELETE FROM public.team_members
    WHERE user_id = OLD.user_id
    AND team_id = v_team_id;
    
    -- Check if team is now empty
    SELECT COUNT(*) INTO v_team_member_count
    FROM public.team_members
    WHERE team_id = v_team_id;
    
    -- If team is empty, delete the team (cascade will delete associated projects)
    IF v_team_member_count = 0 THEN
      DELETE FROM public.teams WHERE id = v_team_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger for unregistration
CREATE TRIGGER on_registration_delete
  BEFORE DELETE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unregistration();