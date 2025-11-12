-- Add portfolio_url field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS portfolio_url text;