-- Add country column to external_surveys
ALTER TABLE public.external_surveys 
ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'US';

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_external_surveys_country ON public.external_surveys(country);
