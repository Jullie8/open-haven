-- Add program_ratings column to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS program_ratings JSONB DEFAULT '{}'::jsonb;