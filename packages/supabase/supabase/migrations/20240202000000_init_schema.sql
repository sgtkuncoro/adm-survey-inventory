-- Database Migration: Create Core Tables for Survey Inventory System

-- 1. Survey Providers
CREATE TABLE IF NOT EXISTS public.survey_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    api_base_url TEXT,
    credentials TEXT, -- API Key
    supplier_id TEXT,
    prescreener_url TEXT,
    private_key TEXT, -- Encrypted
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
CREATE TABLE IF NOT EXISTS public.external_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.survey_providers(id) ON DELETE CASCADE,
    external_bid_id TEXT NOT NULL,
    cpi_cents INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_id, external_bid_id)
);

-- 3. Survey Quotas
CREATE TABLE IF NOT EXISTS public.survey_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.external_surveys(id) ON DELETE CASCADE,
    external_quota_id TEXT NOT NULL,
    cpi_cents INTEGER NOT NULL,
    loi_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(survey_id, external_quota_id)
);

-- 4. Quota Qualifications
CREATE TABLE IF NOT EXISTS public.quota_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quota_id UUID NOT NULL REFERENCES public.survey_quotas(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answers JSONB NOT NULL, -- Array of strings
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Users (Basic Profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY, -- Should match auth.users.id
    email TEXT,
    date_of_birth DATE,
    gender TEXT, -- M, F, O
    wallet_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Survey Sessions
CREATE TABLE IF NOT EXISTS public.survey_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.survey_providers(id) ON DELETE CASCADE,
    bid_id TEXT NOT NULL,
    quota_id TEXT,
    cpi_at_click INTEGER NOT NULL,
    expected_payout INTEGER NOT NULL,
    actual_payout INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    status_detail TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, bid_id, started_at) -- Prevent rapid duplicate clicks if needed
);

-- 7. User Survey Eligibility Cache
CREATE TABLE IF NOT EXISTS public.user_survey_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.survey_providers(id) ON DELETE CASCADE,
    eligible_bids JSONB NOT NULL DEFAULT '[]'::jsonb,
    best_bid JSONB,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider_id)
);

-- Enable RLS (Security)
ALTER TABLE public.survey_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_survey_eligibility ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Admin access usually via service role)
-- For public.users, users can read/write their own record
CREATE POLICY "Users can read their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
