-- Remove duplicate owner insertion that conflicts with RPC create_project_with_owner
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
DROP FUNCTION IF EXISTS public.handle_new_project();