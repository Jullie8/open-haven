ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS sanitized_text TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Notes:
-- - `sanitized_text` stores a cleaned/plain-text version of `review_text` for search/indexing.
-- - `tags` is a text array for simple tagging;
-- - `flagged` is a boolean for moderation flags (default false).
-- - `status` is a text column for moderation workflow; default is 'published'.