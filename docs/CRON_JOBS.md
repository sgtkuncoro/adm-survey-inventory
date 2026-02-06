# Cron Jobs

This document describes the scheduled jobs running in the `apps/worker` Cloudflare Worker.

## Survey Inventory Sync

**Trigger:** Hourly (0 * * * *)  
**Handler:** `syncSurveyInventory`

**Description:**
Fetches the latest survey inventory from Morning Consult and syncs it to the local database.

**Steps:**
1. Fetch all active `survey_providers`.
2. For each provider, call `fetchInventory()` to get available bids.
3. Upsert surveys into `external_surveys` table.
4. Upsert quotas into `survey_quotas` table.
5. Upsert qualifications into `quota_qualifications` table.
6. Deactivate surveys no longer present in the provider's feed.
7. Log results to `sync_job_logs`.

**Monitoring:**
- Check `sync_job_logs` table for `status = 'failed'`.
- Review Cloudflare Worker logs for detailed errors.

## Log Cleanup

**Trigger:** Daily (0 0 * * *)  
**Handler:** `cleanupOldLogs`

**Description:**
Removes old sync job logs beyond a retention period (30 days).
