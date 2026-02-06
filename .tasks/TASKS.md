# Survey Inventory System - Master Task Checklist

**Project:** External Survey Inventory Integration  
**Last Updated:** February 6, 2026

---

## Upcoming: External Provider API Logging

### 6.1 API Request Logging
- [ ] Create `api_request_logs` database migration
- [ ] Build `ApiLogger` utility class
- [ ] Integrate logging into MC client (`fetchInventory`, `checkEligibility`)
- [ ] Link logs to `sync_job_id` for traceability
- [ ] Create admin page to view API logs

---

## Phase 1: Backend Foundation

### 1.1 Database Schema ✅
- [x] Add MC columns to `survey_providers` (supplier_id, private_key, public_key, etc.)
- [x] Create `surveys` table (bid_id, name, country, topic, LOI, incidence_rate)
- [x] Create `survey_quotas` table (cpi_cents, completes_required/current)
- [x] Create `quota_qualifications` table
- [x] Create `qualification_legend` table
- [x] Create `survey_sessions` table
- [x] Create `user_survey_eligibility` table
- [x] Create `wallet_transactions` table
- [x] Create `sync_job_logs` table
- [ ] Generate types in `@packages/supabase` (Manual step required)

### 1.2 Ed25519 Crypto ✅
- [x] Implement key pair generation (`src/lib/crypto/ed25519.ts`)
- [x] Implement private key encryption (`src/lib/crypto/encryption.ts`)
- [x] Implement URL signing (`src/lib/mc/url-signer.ts`)
- [x] Implement signature verification (`src/lib/mc/signature-verify.ts`)

### 1.3 Morning Consult API Client ✅
- [x] Create `MorningConsultClient` (`src/lib/mc/client.ts`)
- [x] Implement `checkEligibility()` - POST /supplier/eligibility
- [x] Implement `fetchInventory()` - GET /supplier/bids
- [x] Implement `getPublicKey()` / `registerPublicKey()`
- [x] Implement `setRedirectUrl()`
- [x] Add rate limiting (100 req/min)
- [x] Add error handling with retry logic

### 1.4 Survey Sync Job ✅
- [x] Create `syncSurveyInventory()` (`src/lib/surveys/sync.ts`)
- [x] Implement survey upsert logic
- [x] Implement quota upsert logic
- [x] Implement qualification upsert logic
- [x] Mark inactive surveys
- [x] Log sync results to `sync_job_logs`

### 1.5 Session & Redirect Handler ✅
- [x] Create `createSurveySession()` (`src/lib/surveys/session.ts`)
- [x] Generate signed entry URLs
- [x] Create redirect handler (`src/routes/redirect.ts`)
- [x] Verify MC signatures on redirect
- [x] Update session status
- [x] Credit wallet on `complete` status
- [x] Implement idempotent updates (prevent double counting)

### 1.6 Eligibility Service ✅
- [x] Create `getUserEligibility()` (`src/lib/surveys/eligibility.ts`)
- [x] Cache results in `user_survey_eligibility`
- [x] Check freshness based on TTL (60 seconds)
- [x] Calculate age from DOB
- [x] Map gender to MC format
- [x] Filter by min CPI ($2.00)

### 1.7 Worker API - Admin Routes
- [x] Provider CRUD (`/api/admin/providers/*`)
- [x] Key generation endpoint
- [x] Redirect URL configuration
- [x] `GET /api/admin/stats` - Dashboard statistics
- [x] `GET /api/admin/surveys` - List surveys with filters
- [x] `GET /api/admin/surveys/:id` - Survey details
- [x] `GET /api/admin/surveys/:id/quotas` - Survey quotas
- [x] `GET /api/admin/providers/:id/legend` - Qualification legend
- [x] `GET /api/admin/jobs` - Sync job logs
- [x] `POST /api/admin/jobs/trigger` - Manual sync trigger

### 1.8 Worker - Cron Configuration
- [x] Add hourly cron trigger to `wrangler.toml`
- [x] Register survey-sync in `scheduled()` handler
- [x] Add log cleanup job (daily)
- [x] Test cron locally with `wrangler dev --test-scheduled`

---

## Phase 2: Admin Dashboard (web-admin)

### 2.1 API Client Setup
- [x] Set up typed API client for Worker
- [x] Configure authentication headers
- [x] Add error handling utilities

### 2.2 Dashboard Page
- [x] Create `/dashboard` route
- [x] Display total surveys count
- [x] Display open surveys count
- [x] Display total quotas/slots
- [x] Display last sync timestamp
- [x] Add "Sync Now" button

### 2.3 Survey Inventory Page
- [x] Create `/surveys` route
- [x] Build survey data table
- [x] Add provider filter
- [x] Add country filter (Schema missing country column)
- [x] Add status filter (open/closed)
- [x] Add CPI range filter
- [x] Add pagination & sorting

### 2.4 Survey Detail Page
- [x] Create `/surveys/[id]` route
- [x] Display survey metadata
- [x] Display quotas table with decoded qualifications
- [ ] Show fill progress per quota

### 2.5 Provider Configuration Pages
- [x] Create `/providers` list page
- [x] Create `/providers/[id]` config page (General, Security, Redirects, Business Rules tabs)
- [x] Create `/providers/[id]/legend` page
- [x] Add key generation UI
- [x] Add API credentials form (secure input)
- [x] Add business rules form (CPI threshold, payout %)

### 2.6 Sync Jobs Page
- [x] Create `/jobs` route (Implemented as `/sync-jobs`)
- [x] Display sync job history table
- [x] Show success/failure status
- [x] Show surveys added/updated/closed counts

---

## Phase 3: User-Facing Experience (web-user)

### 3.1 API Client Setup
- [x] Set up typed API client for Worker
- [x] Configure user authentication

### 3.2 Survey Card Component
- [x] Build `SurveyCard` component in `apps/web-user` (Using local component initially)
- [x] Active state: show "Earn $X.XX"
- [x] Disabled state: show "Check back later"
- [x] Show estimated time (LOI / 60)
- [ ] Document in Storybook (Skipping for now)

### 3.3 Offer Modal Component
- [x] Build `OfferModal` component
- [x] Display payout amount
- [x] Display estimated duration
- [x] "Start Survey" button
- [x] Open survey in new tab

### 3.4 Survey Feed Page
- [x] Create `/surveys` route
- [x] Integrate SurveyCard component
- [x] Handle no eligible surveys state
- [x] Refresh eligibility on interaction

### 3.5 Redirect Result Pages
- [x] Create `/redirect/success` - Completion confirmation
- [x] Create `/redirect/screenout` - Disqualification message
- [x] Create `/redirect/quota` - Quota full message
- [x] Create `/redirect/error` - Error handling

### 3.6 Wallet Page
- [x] Create `/wallet` route
- [x] Display current balance
- [x] Display earnings history
- [x] Show pending/completed sessions

---

## Phase 4: Integration & Testing

### API Integration Tests
- [x] Test survey sync job end-to-end
- [x] Test eligibility check flow
- [x] Test URL signing & verification
- [x] Test redirect handling for each status
- [x] Verify end-to-end with real MC credentials (staging)

### Admin Dashboard E2E
- [x] Test survey list loading
- [x] Test survey detail view
- [x] Test provider configuration
- [x] Test manual sync trigger

### User Flow E2E
- [x] Test eligibility fetch on login
- [x] Test survey card display
- [x] Test start survey flow
- [x] Test redirect completion

---

## Phase 5: Deployment

### Cloudflare Workers
- [x] Configure production secrets
- [x] Deploy worker with `pnpm deploy`
- [x] Verify cron triggers are active
- [x] Test production API endpoints

### Cloudflare Pages - web-admin
- [x] Configure build settings
- [x] Set environment variables
- [x] Deploy and verify

### Cloudflare Pages - web-user
- [x] Configure build settings
- [x] Set environment variables
- [x] Deploy and verify

---

## Documentation

- [x] Update CRON_JOBS.md with final job list
- [x] Update MC_INTEGRATION.md with actual endpoints
- [x] Create API documentation (OpenAPI/Swagger)
- [x] Create runbook for sync failures
