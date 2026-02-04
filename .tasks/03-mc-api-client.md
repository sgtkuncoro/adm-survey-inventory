# Task: MC API Client & Eligibility Service

**Phase**: 1 - Backend Foundation  
**Priority**: High  
**Status**: ✅ Done

## Overview

Build the Morning Consult API client to fetch survey eligibility for users and handle inventory syncing.

## Implementation Details

- **Client**: `MorningConsultClient` in `apps/worker/src/lib/mc/client.ts`
- **Eligibility**: `getUserEligibility` in `apps/worker/src/lib/surveys/eligibility.ts`
- **Inventory Sync**: `syncSurveyInventory` in `apps/worker/src/lib/surveys/sync.ts`

## Features Implemented

1.  **API Client**:
    - `checkEligibility`: Calls `/supplier/eligibility`
    - `fetchInventory`: Calls `/supplier/inventory` (New)
    - `getPublicKey` / `registerPublicKey`
    - `setRedirectUrl`

2.  **Eligibility Service**:
    - Caches results in `user_survey_eligibility` table.
    - Checks freshness based on TTL.
    - Calculates age from DOB.
    - Maps gender to MC format.
    - Filters by active bids and minimum CPI.

3.  **Inventory Sync**:
    - Cron job to fetch and update available bids.
    - Deactivates stale surveys.

## Verification

- [x] Client implemented with strict typing
- [x] Eligibility logic implemented with caching
- [x] Inventory sync implemented (Daily Cron)
- [x] API Endpoints for testing

## Next Key Actions

- Verify end-to-end with real MC credentials in staging.
