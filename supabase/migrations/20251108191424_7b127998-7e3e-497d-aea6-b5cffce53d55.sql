-- Function to automatically add new team members to existing team projects
CREATE OR REPLACE FUNCTION public.handle_team_member_addition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Add the new team member as owner to all projects associated with this team
  INSERT INTO public.project_members (project_id, user_id, role, added_by)
  SELECT 
    p.id,
    NEW.user_id,
    'owner'::project_role,
    NEW.user_id
  FROM public.projects p
  WHERE p.team_id = NEW.team_id
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for team member addition
CREATE TRIGGER on_team_member_added
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_member_addition();