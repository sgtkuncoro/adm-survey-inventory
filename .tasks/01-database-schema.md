# Task: Database Schema for MC Integration

**Phase**: 1 - Backend Foundation  
**Priority**: High  
**Status**: ✅ Done

## Overview

Add new columns to `survey_providers` and create two new tables to support the Morning Consult integration: `survey_sessions` and `user_survey_eligibility`.

## Implementation Details

- **Tables Created**:
  - `survey_providers` (Updated with MC columns)
  - `survey_sessions`
  - `user_survey_eligibility`
  - `wallet_transactions`
- **Location**: `packages/supabase/supabase/migrations/`
- **Migration**: Applied via Supabase CLI.
- **Types**: generated in `@packages/supabase`.

## Schema Changes

### 1. survey_providers Table - Add Columns

Added:

- `supplier_id`
- `prescreener_url`
- `private_key`
- `public_key`
- `min_cpi_cents`
- `user_payout_pct`
- `eligibility_cache_ttl`
- `redirect_urls`

### 2. New Table: survey_sessions

Implemented tracking for:

- `user_id`, `provider_id`, `bid_id`, `quota_id`
- `cpi_at_click`, `expected_payout`, `actual_payout`
- `status`, `status_detail`, `mc_session_id`

### 3. New Table: user_survey_eligibility

Implemented caching for:

- `eligible_bids` (JSONB)
- `best_bid` (JSONB)
- `fetched_at`

## Verification

- [x] All new columns exist in `survey_providers`
- [x] `survey_sessions` table created
- [x] `user_survey_eligibility` table created
- [x] `wallet_transactions` table created
- [x] Types generated in `@packages/supabase`
