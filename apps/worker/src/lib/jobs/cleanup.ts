import type { TypedSupabaseClient } from "@packages/supabase";

export async function cleanupLogs(db: TypedSupabaseClient) {
  console.log("Starting log cleanup...");

  // Keep logs for 7 days
  const retentionDays = 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const { error, count } = await db
    .from("sync_job_logs")
    .delete({ count: "exact" })
    .lt("created_at", cutoffDate.toISOString());

  if (error) {
    console.error("Failed to cleanup logs:", error);
    throw error;
  }

  console.log(`Log cleanup completed. Deleted ${count} old logs.`);
}
