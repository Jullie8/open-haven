-- Drop the old view and recreate with proper security settings
DROP VIEW IF EXISTS public.location_ratings;

-- Create the view with SECURITY INVOKER (not DEFINER) for proper RLS enforcement
CREATE OR REPLACE VIEW public.location_ratings 
WITH (security_invoker = true)
AS
SELECT 
  location_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as average_rating
FROM public.reviews
GROUP BY location_id;