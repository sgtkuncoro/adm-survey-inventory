# Survey Integration Tasks

Based on [Survey_Integration.md](.poc/Survey_Integration.md) (Phase 1).

## 1. Setup & Configuration
- [ ] Initialize `SURVEY_TASKS.md` tracking list
- [ ] Create database migration for survey tables

## 2. Data Storage (Schema)
Create the following tables in Supabase:
- [ ] `survey_providers`
    - `id`, `name`, `api_base_url`, `credentials` (encrypted), `is_active`
- [ ] `external_surveys`
    - `id`, `provider_id` (FK), `external_bid_id`, `name`, `country`, `topic`, `survey_url_base`, `loi`, `published_at`, `expires_at`, `incidence`, `is_active`, `raw_json`
- [ ] `survey_quotas`
    - `id`, `external_survey_id` (FK), `external_quota_id`, `cpi_cents`, `completes_req`, `completes_curr`, `is_open`
- [ ] `quota_qualifications`
    - `id`, `survey_quota_id` (FK), `qual_type`, `qual_values` (JSON)

## 3. API Connection Layer
Implement the service layer to talk to Morning Consult:
- [ ] Create `MorningConsultProvider` class implementing a standard `SurveyProvider` interface
- [ ] Implement `get_bids()` method to fetch `/supplier/bids`
- [ ] Implement `check_eligibility()` method (for future use)
- [ ] Add rate limiting (100 req/min) handling
- [ ] Add error handling and logging for API failures

## 4. Sync Job (Cron)
Create a scheduled job (e.g., using pg_cron or Edge Function):
- [ ] Implement `sync_inventory` function
    - Connects to provider
    - Fetches all active bids
    - Upserts data into `external_surveys` and `survey_quotas`
    - Marks missing surveys as inactive
- [ ] Schedule to run every 60 minutes

## 5. Admin Dashboard UI
Create a view in the admin panel to inspect inventory:
- [ ] **Inventory Table View**
    - Columns: Provider, ID, Topic, Country, Length, CPI Range, Total Slots, Filled, Status, Expires
    - Filters: Provider, Status, Country
- [ ] **Survey Detail View**
    - Show full metadata
    - List all quotas with decoded qualifications (e.g., "Age: 18-34")
- [ ] **Qualification Legend**
    - Page to show mapping of ID codes to labels (e.g., Gender 1=Male)

## 6. Testing & Validation
- [ ] Verify sync job populates database correctly
- [ ] Verify rate limiting prevents 429 errors
- [ ] Verify dashboard shows correct live data
