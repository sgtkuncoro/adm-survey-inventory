import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { generateKeyPair } from "../lib/crypto/ed25519";
import { encryptPrivateKey } from "../lib/crypto/encryption";
import { MorningConsultClient } from "../lib/mc/client";
import type { TypedSupabaseClient } from "@packages/supabase";
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

const getDb = (c: any): TypedSupabaseClient => c.get("db");

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

const app = new OpenAPIHono<Env>()
  .openapi(listProvidersRoute, async (c) => {
    const db = getDb(c);
    const { data: providers, error } = await db
      .from("survey_providers")
      .select("*");

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
  });

export default app;
