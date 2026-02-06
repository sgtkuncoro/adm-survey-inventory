-- Migration: Create missing tables for sync logs and qualifications

-- 1. Qualification Legend (Metadata for questions)
CREATE TABLE IF NOT EXISTS public.qualification_legend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.survey_providers(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_text TEXT,
    answer_options JSONB, -- Map of value -> label
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, question_id)
);

-- Enable RLS
ALTER TABLE public.qualification_legend ENABLE ROW LEVEL SECURITY;

-- 2. Sync Job Logs
CREATE TABLE IF NOT EXISTS public.sync_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.survey_providers(id) ON DELETE SET NULL,
    status TEXT NOT NULL, -- 'success', 'failed', 'running'
    message TEXT,
    items_processed INTEGER DEFAULT 0,
    items_modified INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_job_logs ENABLE ROW LEVEL SECURITY;
