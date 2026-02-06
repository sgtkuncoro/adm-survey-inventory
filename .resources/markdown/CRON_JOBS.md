# Cron Job System Architecture

This project uses a unified "Heartbeat" architecture for background tasks. Instead of managing multiple disparate cron schedules (e.g., in Netlify functions, external services, or database triggers), we use **one single heartbeat** that runs every minute and delegates execution to a database-driven scheduler.

## How It Works

1.  **The Heartbeat (Trigger)**
    *   **File**: `admin/functions/sync-scheduler.ts`
    *   **Mechanism**: A Netlify Scheduled Function running on a `* * * * *` (every minute) cron schedule.
    *   **Action**: It simply sends a request to your Next.js API endpoint: `GET /api/sync-jobs/scheduler`.

2.  **The Scheduler (Coordinator)**
    *   **File**: `admin/app/api/sync-jobs/scheduler/route.ts`
    *   **Action**:
        1.  Queries the `inventory.sync_job_configs` table for enabled jobs.
        2.  Checks if the job is "due" (current time >= last run + cron interval).
        3.  If due, it instantiates the appropriate **Runner**.

3.  **The Runners (Workers)**
    *   **Directory**: `admin/lib/jobs/runners/`
    *   **Registry**: `admin/lib/jobs/index.ts`
    *   **Action**: These are standard TypeScript functions that perform the actual business logic (syncing surveys, refreshing segments, cleaning logs).

## Available Jobs

| Job ID | Description | Default Schedule | Runner File |
| :--- | :--- | :--- | :--- |
| `external-survey-sync` | Syncs surveys from external providers (e.g., Morning Consult). | Every 15 mins | `external-survey-sync.ts` |
| `user-segment-refresh` | Recalculates dynamic user segments based on activity. | Hourly | `user-segment-refresh.ts` |
| `log-cleanup` | Deletes old system logs to maintain performance. | Daily | `log-cleanup.ts` |

## Local Testing

You can trigger the scheduler manually in your local environment without waiting for the Netlify heartbeat.

### Option 1: Using the provided script
Run the following command from the `admin` directory:

```bash
# Triggers the scheduler against your local dev server
npx tsx scripts/trigger-scheduler.ts
```

### Option 2: Using cURL
Ensure your local development server is running (`npm run dev`), then:

```bash
curl http://localhost:3001/api/sync-jobs/scheduler
```

### Option 3: Manual Run via UI
1. Go to **Admin > Dashboard > Sync Jobs**.
2. Click the "Run Now" button next to any configured job.

## Adding a New Job

1.  **Create Runner**: Add a new file in `admin/lib/jobs/runners/my-new-job.ts`. It must implement the `JobRunner` interface.
2.  **Register**: Import and register it in `admin/lib/jobs/index.ts`.
3.  **Configure**: Add a row to the `inventory.sync_job_configs` table with your `job_type_id` and desired cron schedule.

## Deployment

The system is deployed automatically with your Next.js application.
*   **Netlify**: Automatically detects `functions/sync-scheduler.ts` and sets up the background cron.
*   **Supabase**: Holds the configuration state and logs.
