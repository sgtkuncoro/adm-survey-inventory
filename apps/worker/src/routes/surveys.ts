import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { MorningConsultClient } from "../lib/mc/client";
import {
  calculateAge,
  findBestBid,
  isCacheFresh,
  mapGender,
} from "../lib/surveys/eligibility";
import { createSurveySession } from "../lib/surveys/session";
import type { TypedSupabaseClient } from "@packages/supabase";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  db: TypedSupabaseClient;
  user: any; // User type seems implicit in this project, setting to any for now to match strictness
};

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

// Get DB instance from context
const getDb = (c: any): TypedSupabaseClient => c.get("db");

// GET /api/surveys/eligibility
const eligibilityRoute = createRoute({
  method: "get",
  path: "/eligibility",
  summary: "Check survey eligibility",
  description:
    "Checks if the user is eligible for any surveys based on demographics.",
  tags: ["Surveys"],
  responses: {
    200: {
      description: "Eligibility status and best bid",
      content: {
        "application/json": {
          schema: z.object({
            hasEligibleSurveys: z.boolean(),
            surveys: z.array(
              z.object({
                id: z.string(),
                cpi: z.number(),
                loi: z.number().optional(),
              })
            ),
            bestBid: z
              .object({
                externalBidId: z.string(),
                cpiCents: z.number(),
              })
              .optional(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// POST /api/surveys/session
const createSessionSchema = z.object({
  bidId: z.string(),
  quotaId: z.string().optional(),
});

const createSessionRoute = createRoute({
  method: "post",
  path: "/session",
  summary: "Create survey session",
  description: "Creates a new survey session and returns the entry URL.",
  tags: ["Surveys"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createSessionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Session created",
      content: {
        "application/json": {
          schema: z.object({
            sessionId: z.string(),
            entryUrl: z.string(),
            expiresAt: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
    },
    401: {
      description: "Unauthorized",
    },
    404: {
      description: "Not Found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

const app = new OpenAPIHono<Env>()
  .openapi(eligibilityRoute, async (c) => {
    const user = c.get("user");
    const refresh = c.req.query("refresh") === "true";

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getDb(c);

    // Get Morning Consult provider (first active one)
    const { data: providerData, error: providerError } = await db
      .from("survey_providers")
      .select("*")
      .eq("is_active", true)
      .single();

    if (providerError || !providerData) {
      // maybeSingle would return null without error if not found, but single returns error if not found
      return c.json({ hasEligibleSurveys: false });
    }

    const provider = {
      id: providerData.id,
      apiBaseUrl: providerData.api_base_url,
      credentials: providerData.credentials,
      supplierId: providerData.supplier_id,
      minCpiCents: providerData.min_cpi_cents,
      userPayoutPct: providerData.user_payout_pct,
      eligibilityCacheTtl: providerData.eligibility_cache_ttl,
    };

    // Check cache first if not forcing refresh
    if (!refresh) {
      const { data: cached } = await db
        .from("user_survey_eligibility")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider_id", provider.id)
        .maybeSingle();

      if (
        cached &&
        isCacheFresh(new Date(cached.fetched_at), provider.eligibilityCacheTtl)
      ) {
        return c.json({
          hasEligibleSurveys: cached.eligible_bids.length > 0,
          bestBid: cached.best_bid,
        });
      }
    }

    // Fetch fresh eligibility from MC
    try {
      // Check if user has required profile data
      if (!user.dateOfBirth || !user.gender) {
        return c.json({ hasEligibleSurveys: false });
      }

      // Get active bids
      const { data: activeBidsData } = await db
        .from("external_surveys")
        .select("*")
        .eq("provider_id", provider.id)
        .eq("is_active", true)
        .gte("cpi_cents", provider.minCpiCents);

      const activeBids = (activeBidsData || []).map((b) => ({
        externalBidId: b.external_bid_id,
        cpiCents: b.cpi_cents,
      }));

      if (activeBids.length === 0) {
        return c.json({ hasEligibleSurveys: false });
      }

      // Call MC API
      const mcClient = new MorningConsultClient({
        apiKey: provider.credentials,
        baseUrl: provider.apiBaseUrl,
        supplierId: provider.supplierId || "",
      });

      const age = calculateAge(user.dateOfBirth);
      const gender = mapGender(user.gender);

      const eligibleBids = await mcClient.checkEligibility(
        { age, gender },
        activeBids.map((b) => b.externalBidId),
      );

      // Calculate best bid
      const bestBid = findBestBid(eligibleBids, provider.userPayoutPct);

      // Update cache
      await db.from("user_survey_eligibility").upsert(
        {
          user_id: user.id,
          provider_id: provider.id,
          eligible_bids: eligibleBids,
          best_bid: bestBid,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,provider_id" },
      );

      // Map to simple survey objects for frontend
      // We need to fetch LOI from quotas or bid data.
      // The MC response has quotas with LOI.
      // We also need to map externalBidId back to our internal DB id if needed, 
      // OR just use externalBidId for the session creation.
      // The session creation uses `bidId` which expects `external_bid_id` (based on line 270 `.eq("external_bid_id", bidId)`).
      
      const surveys = eligibleBids.map(b => {
          // Find max cpi and avg/max LOI
          const maxCpi = Math.max(...b.quotas.map(q => q.cpi), 0);
          const maxLoi = Math.max(...b.quotas.map(q => q.loi), 0);
          return {
              id: b.bidId,
              cpi: maxCpi,
              loi: Math.ceil(maxLoi / 60)
          };
      });

      return c.json({
        hasEligibleSurveys: eligibleBids.length > 0,
        surveys,
        bestBid,
      });
    } catch (error) {
      console.error("Error fetching eligibility:", error);
      return c.json({ error: "Failed to check eligibility" } as any, 500);
    }
  })
  .openapi(createSessionRoute, async (c) => {
    const user = c.get("user");
    const { bidId, quotaId } = c.req.valid("json");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!user.dateOfBirth || !user.gender) {
      return c.json({ error: "User profile incomplete" }, 400);
    }

    const db = getDb(c);

    // Get provider
    const { data: providerData, error: providerError } = await db
      .from("survey_providers")
      .select("*")
      .eq("is_active", true)
      .single();

    if (providerError || !providerData) {
      return c.json({ error: "No active survey provider" }, 400);
    }

    const provider = {
      id: providerData.id,
      supplierId: providerData.supplier_id,
      prescreenerUrl: providerData.prescreener_url,
      privateKey: providerData.private_key,
      userPayoutPct: providerData.user_payout_pct,
      apiBaseUrl: providerData.api_base_url,
      credentials: providerData.credentials,
    };

    // Get bid
    const { data: bidData, error: bidError } = await db
      .from("external_surveys")
      .select("*")
      .eq("external_bid_id", bidId)
      .single();

    if (bidError || !bidData) {
      return c.json({ error: "Bid not found" }, 404);
    }

    const bid = {
      cpiCents: bidData.cpi_cents,
    };

    // Create session
    try {
      const session = await createSurveySession(
        user.id,
        provider.id,
        bidId,
        quotaId || null,
        { dateOfBirth: user.dateOfBirth, gender: user.gender },
        {
          supplierId: provider.supplierId || "",
          prescreenerUrl: provider.prescreenerUrl || provider.apiBaseUrl,
          privateKey: provider.privateKey || "",
          userPayoutPct: provider.userPayoutPct,
        },
        { cpi: bid.cpiCents },
        db,
      );

      return c.json({
        sessionId: session.sessionId,
        entryUrl: session.entryUrl,
        expiresAt: session.expiresAt.toISOString(),
      });
    } catch (error) {
      console.error("Error creating session:", error);
      return c.json({ error: "Failed to create survey session" } as any, 500);
    }
  });

export default app;
