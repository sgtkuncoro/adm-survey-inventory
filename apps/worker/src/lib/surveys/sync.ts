import { MorningConsultClient } from "../mc/client";
import { createApiLogger } from "../logging/api-logger";
import type { TypedSupabaseClient } from "@packages/supabase";

/**
 * Sync survey inventory from Morning Consult to local database
 */
export async function syncSurveyInventory(db: TypedSupabaseClient) {
  // Start Log
  const { data: jobLog, error: logError } = await db
    .from("sync_job_logs")
    .insert({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (logError) {
    console.error("Failed to create sync log:", logError);
  }

  const logId = jobLog?.id;
  let itemsProcessed = 0;
  let itemsModified = 0;

  try {
    // 1. Get active providers
    const { data: providers, error: providerError } = await db
      .from("survey_providers")
      .select("*")
      .eq("is_active", true);

    if (providerError || !providers) {
      throw new Error(
        "Failed to fetch active survey providers: " + providerError?.message,
      );
    }

    for (const provider of providers) {
      try {
        // Create API logger for this provider and sync job
        const logger = createApiLogger({
          db,
          providerId: provider.id,
          syncJobId: logId,
        });

        const mcClient = new MorningConsultClient({
          apiKey: provider.credentials,
          baseUrl: provider.api_base_url,
          supplierId: provider.supplier_id || "",
          logger, // Pass logger for request/response tracking
        });

        // 2. Fetch current inventory from MC
        const { bids } = await mcClient.fetchInventory();
        console.log(`Fetched ${bids.length} bids from MC for ${provider.name}`);
        itemsProcessed += bids.length;        

        // Get all active bids for this provider
        const { data: existingBids } = await db
          .from("external_surveys")
          .select("external_bid_id")
          .eq("provider_id", provider.id)
          .eq("is_active", true);

        const existingBidIds = new Set(
          existingBids?.map((b) => b.external_bid_id) || [],
        );
        const currentFetchedBidIds = new Set<string>();
        let skippedThreshold = 0;

        // 3. Process each bid
        for (const bid of bids) {
          // Skip bids without a valid bidId
          if (!bid.bidId) {
            console.warn("Skipping bid without bidId:", JSON.stringify(bid).slice(0, 200));
            continue;
          }

          currentFetchedBidIds.add(bid.bidId);

          // Calculate max CPI
          let maxCpi = Math.max(...bid.quotas.map((q) => q.cpi), 0);

          // AUTO-DETECT: If CPI is very low (e.g. < 50), it's likely in Dollars.
          // Convert to cents to match database schema.
          // if (maxCpi > 0 && maxCpi < 50) {
          //   maxCpi = Math.round(maxCpi * 100);
          // }

          // const threshold = provider.min_cpi_cents || 200;

          // Skip if below minimum threshold
          // if (maxCpi < threshold) {
          //   skippedThreshold++;
          //   continue;
          // }

          // Upsert survey
          const { data: survey, error: surveyError } = await db
            .from("external_surveys")
            .upsert(
              {
                provider_id: provider.id,
                external_bid_id: bid.bidId,
                country: bid.country || 'US',
                language_ids: bid.languageIds || [],
                cpi_cents: maxCpi,
                loi_minutes: Math.round(bid.statistics.loi / 60),
                is_active: bid.state === 'active',
                updated_at: new Date().toISOString(),
              },
              { onConflict: "provider_id,external_bid_id" },
            )
            .select()
            .single();

          if (surveyError || !survey) {
            console.error(`Failed to upsert survey ${bid.bidId}:`, surveyError);
            continue;
          }

          itemsModified++;

          // Upsert quotas & qualifications
          for (const quota of bid.quotas) {
            // Convert quota CPI too
            let qCpi = quota.cpi;
            if (qCpi > 0 && qCpi < 50) {
              qCpi = Math.round(qCpi * 100);
            }

            // Upsert Quota with statistics
            const { data: savedQuota } = await db
              .from("survey_quotas")
              .upsert(
                {
                  survey_id: survey.id,
                  external_quota_id: quota.quotaId,
                  cpi_cents: qCpi,
                  loi_minutes: Math.ceil(quota.loi / 60),
                  // Quota statistics from MC API
                  completes_required: quota.numAvailable + quota.numCompletes, // Total target
                  completes_current: quota.numCompletes, // Current completions
                  is_open: quota.isOpen,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "survey_id,external_quota_id" },
              )
              .select()
              .single();

            if (!savedQuota) continue;

            // Process Qualifications
            for (const qual of quota.qualifications || []) {
              // 1. Ensure Question exists in Legend
              await db.from("qualification_legend").upsert(
                {
                  provider_id: provider.id,
                  question_id: qual.questionId,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "provider_id,question_id" },
              );

              // 2. Clear then insert or just upsert?
              // Table quota_qualifications doesn't have a unique constraint on question_id per quota in schema,
              // but it should probably be an upsert anyway.
              await db.from("quota_qualifications").upsert({
                quota_id: savedQuota.id,
                question_id: qual.questionId,
                answers: qual.answers,
              }, { onConflict: 'quota_id,question_id' });
            }
          }
        }

        // 4. Deactivate inactive surveys
        const toDeactivate = [...existingBidIds].filter(
          (id) => !currentFetchedBidIds.has(id),
        );

        if (toDeactivate.length > 0) {
          await db
            .from("external_surveys")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("provider_id", provider.id)
            .in("external_bid_id", toDeactivate);
          
          itemsModified += toDeactivate.length;
        }

        const summary = `Synced ${bids.length} bids for ${provider.name}. Created/Updated: ${itemsModified}. Skipped (Threshold): ${skippedThreshold}. Deactivated: ${toDeactivate.length}.`;
        console.log(summary);
        
        // Update job log message
        if (logId) {
          await db
            .from("sync_job_logs")
            .update({ message: summary })
            .eq("id", logId);
        }
      } catch (error: any) {
        console.error(`Sync failed for provider ${provider.name}:`, error);
        if (logId) {
           await db.from("sync_job_logs").update({ message: `Error for ${provider.name}: ${error.message}` }).eq("id", logId);
        }
      }
    }

    // Update Log: Success
    if (logId) {
      await db
        .from("sync_job_logs")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          items_processed: itemsProcessed,
          items_modified: itemsModified,
        })
        .eq("id", logId);
    }
  } catch (err: any) {
    console.error("Sync job failed:", err);
    // Update Log: Failed
    if (logId) {
      await db
        .from("sync_job_logs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          message: err.message,
        })
        .eq("id", logId);
    }
  }
}
