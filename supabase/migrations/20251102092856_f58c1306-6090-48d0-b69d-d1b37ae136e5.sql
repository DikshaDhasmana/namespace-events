-- Create teams table for hackathon team formation
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table to track team membership
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Function to generate unique referral code for teams
CREATE OR REPLACE FUNCTION public.generate_team_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to check if user is registered for an event
CREATE OR REPLACE FUNCTION public.is_registered_for_event(event_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.registrations
    WHERE user_id = auth.uid()
    AND event_id = event_uuid
    AND status = 'approved'
  );
END;
$$;

-- RLS Policies for teams
CREATE POLICY "Users can view teams for events they're registered for"
ON public.teams
FOR SELECT
TO authenticated
USING (is_registered_for_event(event_id));

CREATE POLICY "Users can create teams for events they're registered for"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  is_registered_for_event(event_id) 
  AND auth.uid() = created_by
);

CREATE POLICY "Users can update their own teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Users can view team members for their events"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_members.team_id
    AND is_registered_for_event(teams.event_id)
  )
);

CREATE POLICY "Users can join teams"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = team_members.team_id
    AND is_registered_for_event(teams.event_id)
  )
);

CREATE POLICY "Users can leave teams"
ON public.team_members
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger to auto-generate referral code if not provided
CREATE OR REPLACE FUNCTION public.set_team_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code TEXT;
  done BOOLEAN := FALSE;
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    WHILE NOT done LOOP
      new_code := generate_team_referral_code();
      IF NOT EXISTS (SELECT 1 FROM public.teams WHERE referral_code = new_code) THEN
        done := TRUE;
      END IF;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_team_referral_code
BEFORE INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.set_team_referral_code();

-- Trigger to update updated_at column
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for team updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;