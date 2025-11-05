-- Create security definer function to check project membership
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id
    AND user_id = p_user_id
  );
END;
$$;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view members of their projects" ON public.project_members;
DROP POLICY IF EXISTS "Owners can add members with team restrictions" ON public.project_members;
DROP POLICY IF EXISTS "Owners can update member roles" ON public.project_members;
DROP POLICY IF EXISTS "Owners can remove contributors" ON public.project_members;
DROP POLICY IF EXISTS "Owners can remove themselves" ON public.project_members;

-- Create new non-recursive policies
CREATE POLICY "Users can view members of their projects"
ON public.project_members
FOR SELECT
USING (is_project_member(project_id, auth.uid()));

CREATE POLICY "Owners can add members with team restrictions"
ON public.project_members
FOR INSERT
WITH CHECK (
  is_project_member(project_id, auth.uid()) AND
  (
    (NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = project_members.project_id AND p.team_id IS NOT NULL))
    OR 
    (EXISTS (SELECT 1 FROM projects p JOIN team_members tm ON tm.team_id = p.team_id 
             WHERE p.id = project_members.project_id AND tm.user_id = project_members.user_id))
  )
);

CREATE POLICY "Owners can update member roles"
ON public.project_members
FOR UPDATE
USING (
  is_project_member(project_id, auth.uid()) AND
  (project_members.user_id = auth.uid() OR project_members.role = 'contributor')
);

CREATE POLICY "Owners can remove contributors"
ON public.project_members
FOR DELETE
USING (
  is_project_member(project_id, auth.uid()) AND
  project_members.role = 'contributor'
);

CREATE POLICY "Owners can remove themselves"
ON public.project_members
FOR DELETE
USING (project_members.user_id = auth.uid() AND project_members.role = 'owner');