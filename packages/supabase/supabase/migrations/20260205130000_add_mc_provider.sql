-- Migration: Add Morning Consult Provider (Sandbox)
INSERT INTO public.survey_providers (
    id,
    name,
    slug,
    api_base_url,
    credentials,
    supplier_id,
    prescreener_url,
    min_cpi_cents,
    user_payout_pct,
    eligibility_cache_ttl,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Morning Consult',
    'morning-consult',
    'https://sample-api-sandbox.morningconsult.com/v1',
    'ODVjNGFmZTItNDExMC00ZGQzLTk2OWQtNDQ3Y2MyNDk1ZDM1OmNkYmU2OTc5LTBlM2EtNDVlOC05NTJiLTIwMDNhZGNhYzI4OQ==',
    '88c4afe2-4110-4dd3-969d-447cc2495d35', -- Extracted from token
    NULL,
    200, -- Default min CPI $2.00
    50,  -- Default payout 50%
    60,  -- Cache eligibility for 60s
    true,
    now(),
    now()
) ON CONFLICT (slug) DO UPDATE SET
    api_base_url = EXCLUDED.api_base_url,
    credentials = EXCLUDED.credentials,
    supplier_id = EXCLUDED.supplier_id,
    is_active = true,
    updated_at = now();
