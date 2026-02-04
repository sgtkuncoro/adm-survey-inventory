import { MorningConsultClient } from "../mc/client";
import type { TypedSupabaseClient } from "@packages/supabase";

/**
 * Sync survey inventory from Morning Consult to local database
 */
export async function syncSurveyInventory(db: TypedSupabaseClient) {
  // 1. Get active providers
  const { data: providers, error: providerError } = await db
    .from("survey_providers")
    .select("*")
    .eq("is_active", true);

  if (providerError || !providers) {
    console.error("Failed to fetch active survey providers:", providerError);
    return;
  }

  for (const provider of providers) {
    try {
      const mcClient = new MorningConsultClient({
        apiKey: provider.credentials,
        baseUrl: provider.api_base_url,
        supplierId: provider.supplier_id || "",
      });

      // 2. Fetch current inventory from MC
      const bids = await mcClient.fetchInventory();

      // Get all active bids for this provider from our DB to track ones that disappeared
      const { data: existingBids } = await db
        .from("external_surveys")
        .select("external_bid_id")
        .eq("provider_id", provider.id)
        .eq("is_active", true);

      const existingBidIds = new Set(
        existingBids?.map((b) => b.external_bid_id) || [],
      );
      const currentFetchedBidIds = new Set<string>();

      // 3. Process each bid
      for (const bid of bids) {
        currentFetchedBidIds.add(bid.bidId);

        // Calculate max CPI from quotas for filtering
        const maxCpi = Math.max(...bid.quotas.map((q) => q.cpi), 0);

        // Skip if below minimum threshold (default 200 cents / $2.00)
        if (maxCpi < (provider.min_cpi_cents || 200)) {
          continue;
        }

        // Upsert survey
        const { data: survey, error: surveyError } = await db
          .from("external_surveys")
          .upsert(
            {
              provider_id: provider.id,
              external_bid_id: bid.bidId,
              cpi_cents: maxCpi,
              is_active: true,
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

        // Upsert quotas for this survey
        for (const quota of bid.quotas) {
          await db.from("survey_quotas").upsert(
            {
              survey_id: survey.id,
              external_quota_id: quota.quotaId,
              cpi_cents: quota.cpi,
              loi_minutes: Math.ceil(quota.loi / 60),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "survey_id,external_quota_id" },
          );
        }
      }

      // 4. Deactivate surveys that are no longer in the MC inventory
      const toDeactivate = [...existingBidIds].filter(
        (id) => !currentFetchedBidIds.has(id),
      );

      if (toDeactivate.length > 0) {
        await db
          .from("external_surveys")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("provider_id", provider.id)
          .in("external_bid_id", toDeactivate);
      }

      console.log(
        `Synced ${bids.length} bids for provider ${provider.name}. Deactivated ${toDeactivate.length}.`,
      );
    } catch (error) {
      console.error(`Sync failed for provider ${provider.name}:`, error);
    }
  }
}
