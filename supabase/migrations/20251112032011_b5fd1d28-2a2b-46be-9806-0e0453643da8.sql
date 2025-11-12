-- Add new profile fields (using quoted identifier for current_role)
ALTER TABLE public.profiles
ADD COLUMN instagram_handle text,
ADD COLUMN discord_username text,
ADD COLUMN twitter_handle text,
ADD COLUMN address text,
ADD COLUMN city_state text,
ADD COLUMN pin_code text,
ADD COLUMN country text,
ADD COLUMN branch text,
ADD COLUMN role text,
ADD COLUMN codeforces_handle text,
ADD COLUMN codechef_handle text,
ADD COLUMN "current_role" text,
ADD COLUMN organisation text,
ADD COLUMN resume_link text;