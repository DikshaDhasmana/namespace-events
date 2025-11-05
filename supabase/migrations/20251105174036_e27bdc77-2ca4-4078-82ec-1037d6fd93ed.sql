-- Create enum for project member roles if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.project_role AS ENUM ('owner', 'contributor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add event_id and team_id to projects table if they don't exist
DO $$ BEGIN
  ALTER TABLE public.projects ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.projects ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create project_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.project_role NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID,
  UNIQUE(project_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on projects table
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Contributors can update projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;

-- Drop ALL existing policies on project_members
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Owners can add members" ON public.project_members;
DROP POLICY IF EXISTS "Owners can remove themselves" ON public.project_members;
DROP POLICY IF EXISTS "Owners can remove contributors" ON public.project_members;
DROP POLICY IF EXISTS "Owners can update member roles (except other owners)" ON public.project_members;
DROP POLICY IF EXISTS "Admins can view all project members" ON public.project_members;

-- New RLS policies for projects with member-based access
CREATE POLICY "Users can view projects they are members of"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and contributors can update projects"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete projects"
  ON public.projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
      AND project_members.role = 'owner'
    )
  );

CREATE POLICY "Admins can view all projects"
  ON public.projects
  FOR SELECT
  USING (is_admin());

-- RLS policies for project_members
CREATE POLICY "Users can view members of their projects"
  ON public.project_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can add members"
  ON public.project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
  );

CREATE POLICY "Owners can remove themselves"
  ON public.project_members
  FOR DELETE
  USING (
    user_id = auth.uid() AND role = 'owner'
  );

CREATE POLICY "Owners can remove contributors"
  ON public.project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
    AND project_members.role = 'contributor'
  );

CREATE POLICY "Owners can update member roles"
  ON public.project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'owner'
    )
    AND (project_members.user_id = auth.uid() OR project_members.role = 'contributor')
  );

CREATE POLICY "Admins can view all project members"
  ON public.project_members
  FOR SELECT
  USING (is_admin());

-- Function to create project with initial owner
CREATE OR REPLACE FUNCTION public.create_project_with_owner(
  p_project_name TEXT,
  p_github_link TEXT DEFAULT NULL,
  p_live_link TEXT DEFAULT NULL,
  p_demo_video_link TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_ppt_link TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_team_member RECORD;
BEGIN
  v_user_id := auth.uid();
  
  -- Create the project
  INSERT INTO public.projects (
    user_id, project_name, github_link, live_link, 
    demo_video_link, description, ppt_link, tags,
    event_id, team_id
  )
  VALUES (
    v_user_id, p_project_name, p_github_link, p_live_link,
    p_demo_video_link, p_description, p_ppt_link, p_tags,
    p_event_id, p_team_id
  )
  RETURNING id INTO v_project_id;
  
  -- If team_id is provided, add all team members as owners
  IF p_team_id IS NOT NULL THEN
    FOR v_team_member IN 
      SELECT user_id FROM public.team_members WHERE team_id = p_team_id
    LOOP
      INSERT INTO public.project_members (project_id, user_id, role, added_by)
      VALUES (v_project_id, v_team_member.user_id, 'owner', v_user_id);
    END LOOP;
  ELSE
    -- Otherwise, just add the creator as owner
    INSERT INTO public.project_members (project_id, user_id, role, added_by)
    VALUES (v_project_id, v_user_id, 'owner', v_user_id);
  END IF;
  
  RETURN v_project_id;
END;
$$;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_team_member_removed ON public.team_members;
DROP FUNCTION IF EXISTS public.handle_team_member_removal();

-- Function to handle team member removal
CREATE FUNCTION public.handle_team_member_removal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove user from all projects associated with this team
  DELETE FROM public.project_members
  WHERE user_id = OLD.user_id
  AND project_id IN (
    SELECT id FROM public.projects WHERE team_id = OLD.team_id
  );
  
  RETURN OLD;
END;
$$;

-- Trigger to handle team member removal
CREATE TRIGGER on_team_member_removed
  BEFORE DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_member_removal();