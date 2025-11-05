-- Add submission period fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS submission_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submission_end TIMESTAMP WITH TIME ZONE;

-- Drop existing update policy for projects
DROP POLICY IF EXISTS "Owners and contributors can update projects" ON public.projects;

-- Create new update policy with submission period check
CREATE POLICY "Members can update projects with time restrictions"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
    AND (
      -- Personal projects (no event_id) can be edited anytime
      projects.event_id IS NULL
      OR
      -- Hackathon projects can only be edited during submission period
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = projects.event_id
        AND now() >= COALESCE(events.submission_start, events.date)
        AND now() <= COALESCE(events.submission_end, events.end_date)
      )
    )
  );

-- Drop existing insert policy for project_members
DROP POLICY IF EXISTS "Owners can add members" ON public.project_members;

-- Create new insert policy that checks team membership for hackathon projects
CREATE POLICY "Owners can add members with team restrictions"
  ON public.project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
    AND (
      -- For personal projects, can add anyone
      NOT EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = project_members.project_id
        AND p.team_id IS NOT NULL
      )
      OR
      -- For hackathon projects, can only add team members
      EXISTS (
        SELECT 1 FROM public.projects p
        JOIN public.team_members tm ON tm.team_id = p.team_id
        WHERE p.id = project_members.project_id
        AND tm.user_id = project_members.user_id
      )
    )
  );

-- Function to check if a project is editable
CREATE OR REPLACE FUNCTION public.is_project_editable(p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_submission_start TIMESTAMP WITH TIME ZONE;
  v_submission_end TIMESTAMP WITH TIME ZONE;
  v_event_date TIMESTAMP WITH TIME ZONE;
  v_event_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get project's event details
  SELECT p.event_id INTO v_event_id
  FROM public.projects p
  WHERE p.id = p_project_id;
  
  -- Personal projects are always editable
  IF v_event_id IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Get event submission period
  SELECT 
    e.submission_start,
    e.submission_end,
    e.date,
    e.end_date
  INTO 
    v_submission_start,
    v_submission_end,
    v_event_date,
    v_event_end_date
  FROM public.events e
  WHERE e.id = v_event_id;
  
  -- Check if within submission period
  RETURN now() >= COALESCE(v_submission_start, v_event_date)
    AND now() <= COALESCE(v_submission_end, v_event_end_date);
END;
$$;