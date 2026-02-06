-- Migration: Add quota statistics columns
-- Per DEVELOPMENT_PLAN.md (lines 113-126), survey_quotas needs:
-- - completes_required: total target slots (num_available + num_completes from MC API)
-- - completes_current: current completions (num_completes from MC API)
-- - is_open: whether quota is still accepting responses

-- Add quota statistics columns
ALTER TABLE public.survey_quotas
ADD COLUMN IF NOT EXISTS completes_required INTEGER,
ADD COLUMN IF NOT EXISTS completes_current INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true;

-- Add index for common query patterns
CREATE INDEX IF NOT EXISTS idx_survey_quotas_is_open 
ON public.survey_quotas (is_open) 
WHERE is_open = true;

-- Comment columns for documentation
COMMENT ON COLUMN public.survey_quotas.completes_required IS 'Total completions needed for this quota (from MC API: num_available + num_completes)';
COMMENT ON COLUMN public.survey_quotas.completes_current IS 'Current number of completions (from MC API: num_completes)';
COMMENT ON COLUMN public.survey_quotas.is_open IS 'Whether quota is still accepting responses';
