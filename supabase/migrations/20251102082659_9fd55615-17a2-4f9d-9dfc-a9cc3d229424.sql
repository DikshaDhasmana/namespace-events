-- Allow public (anon) to manage events from admin UI (uses custom auth, not Supabase auth)
DROP POLICY IF EXISTS "Public can insert events" ON public.events;
DROP POLICY IF EXISTS "Public can update events" ON public.events;
DROP POLICY IF EXISTS "Public can delete events" ON public.events;

CREATE POLICY "Public can insert events"
ON public.events
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public can update events"
ON public.events
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can delete events"
ON public.events
FOR DELETE
TO public
USING (true);