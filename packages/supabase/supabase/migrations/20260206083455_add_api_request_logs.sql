-- Migration: Add API request/response logging for external providers
-- Stores detailed request/response data for debugging and auditing

CREATE TABLE IF NOT EXISTS public.api_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.survey_providers(id) ON DELETE SET NULL,
    
    -- Request details
    method TEXT NOT NULL,               -- GET, POST, PUT, DELETE
    endpoint TEXT NOT NULL,             -- /v1/supplier/bids
    request_url TEXT NOT NULL,          -- Full URL (excluding sensitive params)
    request_headers JSONB,              -- Headers (sanitized, no auth tokens)
    request_body JSONB,                 -- Request body (if applicable)
    
    -- Response details
    response_status INTEGER,            -- HTTP status code
    response_body JSONB,                -- Full response body
    response_headers JSONB,             -- Response headers
    
    -- Metadata
    duration_ms INTEGER,                -- Request duration in milliseconds
    error_message TEXT,                 -- Error details if failed
    sync_job_id UUID REFERENCES public.sync_job_logs(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_api_request_logs_provider 
ON public.api_request_logs(provider_id);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at 
ON public.api_request_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_sync_job 
ON public.api_request_logs(sync_job_id);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_status 
ON public.api_request_logs(response_status);

-- Enable RLS
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
COMMENT ON TABLE public.api_request_logs IS 'Detailed logs of all API requests to external survey providers';
COMMENT ON COLUMN public.api_request_logs.request_headers IS 'Request headers with auth tokens removed';
COMMENT ON COLUMN public.api_request_logs.response_body IS 'Full response body from provider API';
COMMENT ON COLUMN public.api_request_logs.sync_job_id IS 'Links to parent sync job for traceability';
