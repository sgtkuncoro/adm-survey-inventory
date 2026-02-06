-- Add loi_minutes to external_surveys
ALTER TABLE public.external_surveys
ADD COLUMN IF NOT EXISTS loi_minutes INTEGER;

-- Add index for filtering by length
CREATE INDEX IF NOT EXISTS idx_external_surveys_loi_minutes
ON public.external_surveys (loi_minutes);
