import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { generateKeyPair } from "../lib/crypto/ed25519";
import { encryptPrivateKey } from "../lib/crypto/encryption";
import { MorningConsultClient } from "../lib/mc/client";
import { type TypedSupabaseClient, createAdminClient } from "@packages/supabase";
import { syncSurveyInventory } from "../lib/surveys/sync";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

type Variables = {
  db: TypedSupabaseClient;
  user: any;
};

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

const getDb = (c: any): TypedSupabaseClient => createAdminClient(c.env);

// Schemas
const providerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  apiBaseUrl: z.string().nullable(),
  credentials: z.string().nullable(),
  supplierId: z.string().nullable(),
  prescreenerUrl: z.string().nullable(),
  privateKey: z.string().nullable(),
  publicKey: z.string().nullable(),
  minCpiCents: z.number(),
  userPayoutPct: z.number(),
  eligibilityCacheTtl: z.number(),
  redirectUrls: z.record(z.string()).nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// GET /api/admin/providers
const listProvidersRoute = createRoute({
  method: "get",
  path: "/providers",
  summary: "List survey providers",
  tags: ["Admin"],
  responses: {
    200: {
      description: "List of providers",
      content: {
        "application/json": {
          schema: z.array(providerSchema),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/providers/:id
const getProviderRoute = createRoute({
  method: "get",
  path: "/providers/:id",
  summary: "Get survey provider",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Provider details",
      content: {
        "application/json": {
          schema: providerSchema,
        },
      },
    },
    404: {
      description: "Provider not found",
    },
  },
});

// POST /api/admin/providers
const createProviderSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  apiBaseUrl: z.string().url(),
  credentials: z.string().optional(),
  supplierId: z.string().optional(),
});

const createProviderRoute = createRoute({
  method: "post",
  path: "/providers",
  summary: "Create survey provider",
  tags: ["Admin"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createProviderSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Provider created",
      content: {
        "application/json": {
          schema: providerSchema,
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// PUT /api/admin/providers/:id
const updateProviderSchema = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  apiBaseUrl: z.string().url().optional(),
  credentials: z.string().optional(),
  supplierId: z.string().uuid().optional().nullable(),
  prescreenerUrl: z.string().url().optional().nullable(),
  minCpiCents: z.number().int().min(0).optional(),
  userPayoutPct: z.number().int().min(0).max(100).optional(),
  eligibilityCacheTtl: z.number().int().min(0).optional(),
  redirectUrls: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateProviderRoute = createRoute({
  method: "put",
  path: "/providers/:id",
  summary: "Update survey provider",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateProviderSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Provider updated",
      content: {
        "application/json": {
          schema: providerSchema,
        },
      },
    },
    404: {
      description: "Provider not found",
    },
  },
});

// POST /api/admin/providers/:id/generate-key
const generateKeyRoute = createRoute({
  method: "post",
  path: "/providers/:id/generate-key",
  summary: "Generate new key pair for provider",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Key generated",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            publicKey: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Provider not found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/providers/:id/public-key
const getPublicKeyRoute = createRoute({
  method: "get",
  path: "/providers/:id/public-key",
  summary: "Get provider public key",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Public Key",
      content: {
        "application/json": {
          schema: z.object({
            publicKey: z.string().nullable(),
          }),
        },
      },
    },
    404: {
      description: "Provider not found",
    },
  },
});

// POST /api/admin/providers/:id/register-key
const registerKeyRoute = createRoute({
  method: "post",
  path: "/providers/:id/register-key",
  summary: "Register public key with provider API",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Key registered",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
    },
    404: {
      description: "Provider not found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// POST /api/admin/providers/:id/set-redirects
const setRedirectsSchema = z.record(z.string().url());
const setRedirectsRoute = createRoute({
  method: "post",
  path: "/providers/:id/set-redirects",
  summary: "Set redirect URLs in provider API",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: setRedirectsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Redirects set",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
    },
    404: {
      description: "Provider not found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/jobs
const listJobsRoute = createRoute({
  method: "get",
  path: "/jobs",
  summary: "List sync jobs",
  tags: ["Admin"],
  responses: {
    200: {
      description: "List of sync jobs",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.string().uuid(),
              providerId: z.string().uuid().nullable(),
              status: z.string(),
              message: z.string().nullable(),
              itemsProcessed: z.number().nullable(),
              itemsModified: z.number().nullable(),
              startedAt: z.string(),
              completedAt: z.string().nullable(),
              createdAt: z.string(),
            })
          ),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// POST /api/admin/jobs/:id/cancel
const cancelJobRoute = createRoute({
  method: "post",
  path: "/jobs/:id/cancel",
  summary: "Cancel and mark a job as failed",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Job cancelled",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Job not found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// POST /api/admin/jobs/trigger
const triggerJobSchema = z.object({
  jobId: z.string(),
});

const triggerJobRoute = createRoute({
  method: "post",
  path: "/jobs/trigger",
  summary: "Trigger a background job",
  tags: ["Admin"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: triggerJobSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Job triggered",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// POST /api/admin/inventory-sync
const inventorySyncRoute = createRoute({
  method: "post",
  path: "/inventory-sync",
  summary: "Manually trigger survey inventory sync",
  tags: ["Admin"],
  responses: {
    200: {
      description: "Sync triggered",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/logs
const listLogsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  providerId: z.string().optional(),
  status: z.string().optional(), // "error" | "success" | "all"
  method: z.string().optional(),
  syncJobId: z.string().optional(),
});

const listLogsRoute = createRoute({
  method: "get",
  path: "/logs",
  summary: "Get API Request Logs",
  tags: ["Admin"],
  request: {
    query: listLogsSchema,
  },
  responses: {
    200: {
      description: "List of API logs",
      content: {
        "application/json": {
          schema: z.object({
            logs: z.array(z.object({
              id: z.string().uuid(),
              providerId: z.string().uuid().nullable(),
              method: z.string(),
              endpoint: z.string(),
              requestUrl: z.string(),
              requestHeaders: z.any().nullable(),
              requestBody: z.any().nullable(),
              responseStatus: z.number().nullable(),
              responseBody: z.any().nullable(),
              responseHeaders: z.any().nullable(),
              durationMs: z.number().nullable(),
              errorMessage: z.string().nullable(),
              syncJobId: z.string().uuid().nullable(),
              createdAt: z.string(),
              provider: z.object({
                name: z.string(),
              }).optional().nullable(),
            })),
            total: z.number(),
            page: z.number(),
            limit: z.number(),
          }),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/stats
const statsRoute = createRoute({
  method: "get",
  path: "/stats",
  summary: "Get dashboard statistics",
  tags: ["Admin"],
  responses: {
    200: {
      description: "Dashboard stats",
      content: {
        "application/json": {
          schema: z.object({
            totalSurveys: z.number(),
            openSurveys: z.number(),
            avgCpi: z.number(),
            totalSlots: z.number(),
            avgLoi: z.number(),
            lastSync: z.string().nullable(),
          }),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/surveys
const listSurveysSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  providerId: z.string().optional(),
  minCpi: z.string().optional(),
  maxCpi: z.string().optional(),
  minLoi: z.string().optional(),
  maxLoi: z.string().optional(),
  isActive: z.string().optional(),
  country: z.string().optional(),
});

const listSurveysRoute = createRoute({
  method: "get",
  path: "/",
  summary: "List survey inventory",
  tags: ["Admin"],
  request: {
    query: listSurveysSchema,
  },
  responses: {
    200: {
      description: "List of surveys",
      content: {
        "application/json": {
          schema: z.object({
            surveys: z.array(z.any()),
            total: z.number(),
            page: z.number(),
            totalPages: z.number(),
          }),
        },
      },
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

// GET /api/admin/surveys/:id
const getSurveyRoute = createRoute({
  method: "get",
  path: "/:id",
  summary: "Get survey details",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Survey details",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().uuid(),
            providerId: z.string().uuid(),
            externalBidId: z.string(),
            cpiCents: z.number(),
            isActive: z.boolean(),
            loiMinutes: z.number().optional().nullable(),
            createdAt: z.string(),
            updatedAt: z.string(),
            provider: z.object({
              name: z.string(),
            }).nullable(),
          }),
        },
      },
    },
    404: {
      description: "Survey not found",
    },
  },
});

// GET /api/admin/surveys/:id/quotas
const getQuotasRoute = createRoute({
  method: "get",
  path: "/:id/quotas",
  summary: "List survey quotas",
  tags: ["Admin"],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "List of quotas",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.string().uuid(),
              surveyId: z.string().uuid(),
              externalQuotaId: z.string(),
              cpiCents: z.number(),
              loiMinutes: z.number().nullable(),
              completesRequired: z.number().nullable().optional(),
              completesCurrent: z.number().nullable().optional(),
              isOpen: z.boolean().nullable().optional(),
              createdAt: z.string(),
              updatedAt: z.string(),
            })
          ),
        },
      },
    },
    404: {
      description: "Survey not found",
    },
  },
});

const surveyApp = new OpenAPIHono<Env>()
  .openapi(listSurveysRoute, async (c) => {
    const db = getDb(c);
    const query = c.req.valid("query");
    
    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "20");
    const offset = (page - 1) * limit;

    let dbQuery = db
      .from("external_surveys")
      .select("*, provider:survey_providers(name), quotas:survey_quotas(completes_required, completes_current)", { count: "exact" });

    if (query.providerId) {
      dbQuery = dbQuery.eq("provider_id", query.providerId);
    }
    
    if (query.minCpi) {
      dbQuery = dbQuery.gte("cpi_cents", parseFloat(query.minCpi) * 100);
    }
    if (query.maxCpi) {
      dbQuery = dbQuery.lte("cpi_cents", parseFloat(query.maxCpi) * 100);
    }

    if (query.minLoi) {
      dbQuery = dbQuery.gte("loi_minutes", parseInt(query.minLoi));
    }
    if (query.maxLoi) {
      dbQuery = dbQuery.lte("loi_minutes", parseInt(query.maxLoi));
    }

    if (query.isActive !== undefined) {
      dbQuery = dbQuery.eq("is_active", query.isActive === "true");
    }

    if (query.country) {
      dbQuery = dbQuery.eq("country", query.country);
    }

    const { data: surveys, count, error } = await dbQuery
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    const mapped = (surveys || []).map((s: any) => {
      const quotas = s.quotas || [];
      const totalNeeded = quotas.reduce((sum: number, q: any) => sum + (q.completes_required || 0), 0);
      const totalFilled = quotas.reduce((sum: number, q: any) => sum + (q.completes_current || 0), 0);
      // Cap at 100% just in case
      const fillProgress = totalNeeded > 0 ? Math.min((totalFilled / totalNeeded) * 100, 100) : 0;

      return {
        id: s.id,
        providerId: s.provider_id,
        externalBidId: s.external_bid_id,
        languageIds: s.language_ids || [],
        cpiCents: s.cpi_cents,
        loiMinutes: s.loi_minutes,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        provider: s.provider,
        quotaCount: quotas.length,
        fillProgress,
      };
    });

    return c.json({
      surveys: mapped,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  })
  .openapi(getSurveyRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { data: survey, error } = await db
      .from("external_surveys")
      .select("*, provider:survey_providers(name)")
      .eq("id", id)
      .single();

    if (error || !survey) {
      return c.json({ error: "Survey not found" }, 404);
    }

    return c.json({
      id: survey.id,
      providerId: survey.provider_id,
      externalBidId: survey.external_bid_id,
      languageIds: survey.language_ids || [],
      cpiCents: survey.cpi_cents,
      loiMinutes: survey.loi_minutes,
      isActive: survey.is_active,
      createdAt: survey.created_at,
      updatedAt: survey.updated_at,
      provider: survey.provider,
    });
  })
  .openapi(getQuotasRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    // Fetch quotas with their qualifications
    const { data: quotas, error } = await db
      .from("survey_quotas")
      .select("*, quota_qualifications(*)")
      .eq("survey_id", id);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    const mapped = (quotas || []).map((q) => ({
      id: q.id,
      surveyId: q.survey_id,
      externalQuotaId: q.external_quota_id,
      cpiCents: q.cpi_cents,
      loiMinutes: q.loi_minutes,
      // Quota statistics (Needed/Filled)
      completesRequired: q.completes_required,
      completesCurrent: q.completes_current,
      isOpen: q.is_open,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      quota_qualifications: (q.quota_qualifications || []).map((qual: any) => ({
        questionId: qual.question_id,
        answers: qual.answers || [],
      })),
    }));

    return c.json({ quotas: mapped });
  });

// ... existing app ...
const app = new OpenAPIHono<Env>()
  .route("/surveys", surveyApp)
  // Stats route
  .openapi(statsRoute, async (c) => {
    const db = getDb(c);
    
    try {
      const { data: stats, error } = await db.rpc("get_inventory_stats");

      if (error) {
        throw error;
      }

      const s = stats?.[0] || {
        total_surveys: 0,
        active_surveys: 0,
        avg_cpi_cents: 0,
        avg_loi_minutes: 0,
        total_slots: 0,
        last_sync: null,
      };

      return c.json({
        totalSurveys: Number(s.total_surveys),
        openSurveys: Number(s.active_surveys),
        avgCpi: Number(s.avg_cpi_cents) / 100,
        avgLoi: Number(s.avg_loi_minutes),
        totalSlots: Number(s.total_slots),
        lastSync: s.last_sync,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      return c.json({ error: "Failed to fetch stats" } as any, 500);
    }
  })
  // ... existing routes
  .openapi(listProvidersRoute, async (c) => {
    const db = getDb(c);
    const { data: providers, error } = await db
      .from("survey_providers")
      .select("*");

    console.log("providers", providers);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    // Map to camelCase
    const mapped = (providers || []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      apiBaseUrl: p.api_base_url,
      credentials: p.credentials,
      supplierId: p.supplier_id,
      prescreenerUrl: p.prescreener_url,
      privateKey: p.private_key,
      publicKey: p.public_key,
      minCpiCents: p.min_cpi_cents,
      userPayoutPct: p.user_payout_pct,
      eligibilityCacheTtl: p.eligibility_cache_ttl,
      redirectUrls: p.redirect_urls,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return c.json(mapped);
  })
  .openapi(createProviderRoute, async (c) => {
    const db = getDb(c);
    const body = c.req.valid("json");

    const { data: provider, error } = await db
      .from("survey_providers")
      .insert({
        name: body.name,
        slug: body.slug,
        api_base_url: body.apiBaseUrl,
        credentials: body.credentials,
        supplier_id: body.supplierId,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    const mapped = {
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      apiBaseUrl: provider.api_base_url,
      credentials: provider.credentials,
      supplierId: provider.supplier_id,
      prescreenerUrl: provider.prescreener_url,
      privateKey: provider.private_key,
      publicKey: provider.public_key,
      minCpiCents: provider.min_cpi_cents,
      userPayoutPct: provider.user_payout_pct,
      eligibilityCacheTtl: provider.eligibility_cache_ttl,
      redirectUrls: provider.redirect_urls,
      isActive: provider.is_active,
      createdAt: provider.created_at,
      updatedAt: provider.updated_at,
    };

    return c.json(mapped, 201);
  })
  .openapi(getProviderRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { data: provider, error } = await db
      .from("survey_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !provider) {
      return c.json({ error: "Provider not found" }, 404);
    }

    // Map to camelCase and exclude private key
    const safeProvider = {
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      apiBaseUrl: provider.api_base_url,
      credentials: provider.credentials,
      supplierId: provider.supplier_id,
      prescreenerUrl: provider.prescreener_url,
      publicKey: provider.public_key,
      minCpiCents: provider.min_cpi_cents,
      userPayoutPct: provider.user_payout_pct,
      eligibilityCacheTtl: provider.eligibility_cache_ttl,
      redirectUrls: provider.redirect_urls,
      isActive: provider.is_active,
      createdAt: provider.created_at,
      updatedAt: provider.updated_at,
      privateKey: null, // Exclude private key
    };

    return c.json(safeProvider);
  })
  .openapi(updateProviderRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    // Map camelCase updates to snake_case
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.apiBaseUrl !== undefined)
      dbUpdates.api_base_url = updates.apiBaseUrl;
    if (updates.credentials !== undefined)
      dbUpdates.credentials = updates.credentials;
    if (updates.supplierId !== undefined)
      dbUpdates.supplier_id = updates.supplierId;
    if (updates.prescreenerUrl !== undefined)
      dbUpdates.prescreener_url = updates.prescreenerUrl;
    if (updates.minCpiCents !== undefined)
      dbUpdates.min_cpi_cents = updates.minCpiCents;
    if (updates.userPayoutPct !== undefined)
      dbUpdates.user_payout_pct = updates.userPayoutPct;
    if (updates.eligibilityCacheTtl !== undefined)
      dbUpdates.eligibility_cache_ttl = updates.eligibilityCacheTtl;
    if (updates.redirectUrls !== undefined)
      dbUpdates.redirect_urls = updates.redirectUrls;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data: updated, error } = await db
      .from("survey_providers")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return c.json({ error: "Provider not found" }, 404);
    }

    // Map back to camelCase
    const mapped = {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      apiBaseUrl: updated.api_base_url,
      credentials: updated.credentials,
      supplierId: updated.supplier_id,
      prescreenerUrl: updated.prescreener_url,
      privateKey: updated.private_key,
      publicKey: updated.public_key,
      minCpiCents: updated.min_cpi_cents,
      userPayoutPct: updated.user_payout_pct,
      eligibilityCacheTtl: updated.eligibility_cache_ttl,
      redirectUrls: updated.redirect_urls,
      isActive: updated.is_active,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    return c.json(mapped);
  })
  .openapi(generateKeyRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { data: provider, error: fetchError } = await db
      .from("survey_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !provider) {
      return c.json({ error: "Provider not found" }, 404);
    }

    // Generate new key pair
    const keyPair = generateKeyPair();

    // Encrypt private key
    const encryptedPrivateKey = encryptPrivateKey(keyPair.privateKey);

    // Update provider
    const { error: updateError } = await db
      .from("survey_providers")
      .update({
        private_key: encryptedPrivateKey,
        public_key: keyPair.publicKey,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return c.json({ error: "Failed to update provider keys" } as any, 500);
    }

    return c.json({
      success: true,
      publicKey: keyPair.publicKey,
      message:
        "Key generated successfully. Remember to register this public key with Morning Consult.",
    });
  })
  .openapi(getPublicKeyRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { data: provider, error } = await db
      .from("survey_providers")
      .select("public_key")
      .eq("id", id)
      .single();

    if (error || !provider) {
      return c.json({ error: "Provider not found" }, 404);
    }

    return c.json({ publicKey: provider.public_key });
  })
  .openapi(registerKeyRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { data: provider, error } = await db
      .from("survey_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !provider) {
      return c.json({ error: "Provider not found" }, 404);
    }

    if (!provider.public_key) {
      return c.json({ error: "No public key generated yet" } as any, 400);
    }

    if (!provider.api_base_url || !provider.credentials) {
      return c.json({ error: "Provider configuration incomplete" } as any, 400);
    }

    try {
      const mcClient = new MorningConsultClient({
        apiKey: provider.credentials,
        baseUrl: provider.api_base_url,
        supplierId: provider.supplier_id || "",
      });

      await mcClient.registerPublicKey(provider.public_key);

      return c.json({
        success: true,
        message: "Public key registered with Morning Consult",
      });
    } catch (error) {
      console.error("Failed to register key:", error);
      return c.json(
        { error: "Failed to register key with Morning Consult" } as any,
        500,
      );
    }
  })
  .openapi(setRedirectsRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");
    const redirects = c.req.valid("json");

    const { data: provider, error } = await db
      .from("survey_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !provider) {
      return c.json({ error: "Provider not found" }, 404);
    }

    if (!provider.api_base_url || !provider.credentials) {
      return c.json({ error: "Provider configuration incomplete" } as any, 400);
    }

    try {
      const mcClient = new MorningConsultClient({
        apiKey: provider.credentials,
        baseUrl: provider.api_base_url,
        supplierId: provider.supplier_id || "",
      });

      // Set default redirect
      if (redirects.default) {
        await mcClient.setDefaultRedirectUrl(redirects.default);
      }

      // Set status-specific redirects
      const statusIds = [
        "complete",
        "screenout",
        "over_quota",
        "quality_term",
        "timeout",
      ];
      for (const statusId of statusIds) {
        if (redirects[statusId]) {
          await mcClient.setRedirectUrl(statusId, redirects[statusId]);
        }
      }

      // Save to database
      const { error: updateError } = await db
        .from("survey_providers")
        .update({
          redirect_urls: redirects,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      return c.json({
        success: true,
        message: "Redirect URLs set with Morning Consult",
      });
    } catch (error) {
      console.error("Failed to set redirects:", error);
      return c.json(
        { error: "Failed to set redirect URLs with Morning Consult" } as any,
        500,
      );
    }
  })
  .openapi(inventorySyncRoute, async (c) => {
    const db = getDb(c);
    try {
      await syncSurveyInventory(db);
      return c.json({
        success: true,
        message: "Inventory sync completed successfully",
      });
    } catch (error) {
      console.error("Manual sync failed:", error);
      return c.json({ error: "Sync failed" } as any, 500);
    }
  })
  .openapi(listJobsRoute, async (c) => {
    const db = getDb(c);
    const { data: jobs, error } = await db
      .from("sync_job_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    const mapped = (jobs || []).map((job) => ({
      id: job.id,
      providerId: job.provider_id,
      status: job.status,
      message: job.message,
      itemsProcessed: job.items_processed,
      itemsModified: job.items_modified,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdAt: job.created_at,
    }));

    return c.json(mapped);
  })
  .openapi(cancelJobRoute, async (c) => {
    const db = getDb(c);
    const id = c.req.param("id");

    const { error } = await db
      .from("sync_job_logs")
      .update({
        status: "failed",
        message: "Cancelled by user",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    return c.json({
      success: true,
      message: "Job cancelled",
    });
  })
  .openapi(listLogsRoute, async (c) => {
    const db = getDb(c);
    const { page, limit, providerId, status, method, syncJobId } = c.req.valid("query");

    const pageNum = parseInt(page || "1");
    const limitNum = parseInt(limit || "20");
    const offset = (pageNum - 1) * limitNum;

    let query = db
      .from("api_request_logs")
      .select("*, provider:survey_providers(name)", { count: "exact" });

    if (providerId) {
      query = query.eq("provider_id", providerId);
    }
    if (status === "error") {
      query = query.gte("response_status", 400);
    } else if (status === "success") {
      query = query.lt("response_status", 400);
    }
    if (method) {
      query = query.eq("method", method.toUpperCase());
    }
    if (syncJobId) {
      query = query.eq("sync_job_id", syncJobId);
    }

    const { data: logs, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (error) {
      return c.json({ error: error.message } as any, 500);
    }

    const mapped = (logs || []).map((log) => ({
      id: log.id,
      providerId: log.provider_id,
      method: log.method,
      endpoint: log.endpoint,
      requestUrl: log.request_url,
      requestHeaders: log.request_headers,
      requestBody: log.request_body,
      responseStatus: log.response_status,
      responseBody: log.response_body,
      responseHeaders: log.response_headers,
      durationMs: log.duration_ms,
      errorMessage: log.error_message,
      syncJobId: log.sync_job_id,
      createdAt: log.created_at,
      provider: log.provider,
    }));

    return c.json({
      logs: mapped,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
    });
  })
  .openapi(triggerJobRoute, async (c) => {
    const db = getDb(c);
    const { jobId } = c.req.valid("json");

    if (jobId !== "survey-sync") {
      return c.json({ error: "Invalid job ID" } as any, 400);
    }

    try {
      // Run sync in background (or await if simple)
      // For now we await it to return success status easily, 
      // but in production for long jobs use ctx.waitUntil()
      await syncSurveyInventory(db);
      
      return c.json({
        success: true,
        message: "Inventory sync triggered successfully",
      });
    } catch (error) {
      console.error("Manual sync failed:", error);
      return c.json({ error: "Sync failed" } as any, 500);
    }
  });

export default app;
