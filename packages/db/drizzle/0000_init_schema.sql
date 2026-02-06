-- Migration: 0000 - Initial Schema
-- Creates all core tables for the Survey Inventory System

-- 1. Survey Providers
CREATE TABLE IF NOT EXISTS survey_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    api_base_url TEXT,
    credentials TEXT,
    supplier_id TEXT,
    prescreener_url TEXT,
    private_key TEXT,
    public_key TEXT,
    min_cpi_cents INTEGER NOT NULL DEFAULT 200,
    user_payout_pct INTEGER NOT NULL DEFAULT 50,
    eligibility_cache_ttl INTEGER NOT NULL DEFAULT 60,
    redirect_urls JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. External Surveys (Inventory)
CREATE TABLE IF NOT EXISTS external_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES survey_providers(id) ON DELETE CASCADE,
    external_bid_id TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',
    cpi_cents INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, external_bid_id)
);

-- 3. Survey Quotas
CREATE TABLE IF NOT EXISTS survey_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES external_surveys(id) ON DELETE CASCADE,
    external_quota_id TEXT NOT NULL,
    cpi_cents INTEGER NOT NULL,
    loi_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(survey_id, external_quota_id)
);

-- 4. Quota Qualifications
CREATE TABLE IF NOT EXISTS quota_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quota_id UUID NOT NULL REFERENCES survey_quotas(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(quota_id, question_id)
);

-- 5. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT,
    date_of_birth DATE,
    gender TEXT,
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Survey Sessions
CREATE TABLE IF NOT EXISTS survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES survey_providers(id) ON DELETE CASCADE,
    bid_id TEXT NOT NULL,
    quota_id TEXT,
    cpi_at_click INTEGER NOT NULL,
    expected_payout INTEGER NOT NULL,
    actual_payout INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    status_detail TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 7. User Survey Eligibility Cache
CREATE TABLE IF NOT EXISTS user_survey_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES survey_providers(id) ON DELETE CASCADE,
    eligible_bids JSONB NOT NULL DEFAULT '[]'::jsonb,
    best_bid JSONB,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider_id)
);

-- 8. Sync Job Logs
CREATE TABLE IF NOT EXISTS sync_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES survey_providers(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    message TEXT,
    items_processed INTEGER DEFAULT 0,
    items_modified INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Qualification Legend
CREATE TABLE IF NOT EXISTS qualification_legend (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES survey_providers(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_text TEXT,
    answer_options JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, question_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_external_surveys_provider ON external_surveys(provider_id);
CREATE INDEX IF NOT EXISTS idx_external_surveys_country ON external_surveys(country);
CREATE INDEX IF NOT EXISTS idx_external_surveys_active ON external_surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_quotas_survey ON survey_quotas(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_user ON survey_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_job_logs_status ON sync_job_logs(status);
