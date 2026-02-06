-- Migration: Add language_ids column to external_surveys
-- Language data is at the survey/bid level in Morning Consult API, not quota level

ALTER TABLE public.external_surveys
ADD COLUMN IF NOT EXISTS language_ids TEXT[];

-- Add index for language filtering
CREATE INDEX IF NOT EXISTS idx_external_surveys_language_ids 
ON public.external_surveys USING GIN (language_ids);

COMMENT ON COLUMN public.external_surveys.language_ids IS 'Array of language codes supported by this survey (e.g., ["en", "es"])';
