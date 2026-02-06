# Sync Failure Runbook

This runbook describes how to diagnose and resolve issues with the survey synchronization job.

## Alert Trigger

A sync failure is logged when `sync_job_logs.status = 'failed'`.

## Investigation Steps

### 1. Check Recent Logs

```sql
SELECT * FROM sync_job_logs ORDER BY started_at DESC LIMIT 10;
```

Look for `status = 'failed'` and review the `message` column.

### 2. Review Cloudflare Worker Logs

Navigate to Cloudflare Dashboard > Workers > `survey-inventory-worker` > Logs.
Filter by "error" to find relevant stack traces.

### 3. Common Issues

| Symptom                        | Cause                                  | Resolution                            |
|--------------------------------|----------------------------------------|---------------------------------------|
| `MC eligibility check failed`  | Invalid API Key or expired credentials | Update `credentials` in `survey_providers`. |
| `Failed to fetch MC inventory` | Network issue or MC outage             | Retry later. Check MC status page.    |
| `Failed to upsert survey`      | Database constraint violation          | Check for duplicate bid IDs.          |
| `SUPABASE_SERVICE_ROLE_KEY` missing | Missing env var                     | Verify `wrangler.toml` or secrets.    |

### 4. Manual Resync

If needed, trigger a manual sync from the Admin Dashboard:
- Navigate to `/sync-jobs`.
- Click "Sync Now".

Or via API:
```bash
curl -X POST https://your-worker.workers.dev/api/admin/inventory-sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Escalation

If the issue persists after retries and manual verification, escalate to platform engineering.
