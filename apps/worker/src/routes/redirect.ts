import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
// import { generateKeyPair } from "../lib/crypto/ed25519";
// import { encryptPrivateKey } from "../lib/crypto/encryption";
import { MorningConsultClient } from "../lib/mc/client";
import { verifyRedirectSignature } from "../lib/mc/url-signer";
import type { TypedSupabaseClient } from "@packages/supabase";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
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

// Redirect handler - GET /api/surveys/redirect
const redirectSchema = z.object({
  status: z.enum([
    "complete",
    "screenout",
    "over_quota",
    "quality_term",
    "timeout",
    "unknown",
  ]),
  session: z.string().uuid(), // Our session ID (session_metadata)
  payout: z.string().optional(), // interview_cost in cents
  status_id: z.string().optional(),
  status_detail_id: z.string().optional(),
  signature: z.string(),
});

const redirectRoute = createRoute({
  method: "get",
  path: "/redirect",
  summary: "Handle survey redirect",
  description: "Handles redirects from survey providers like Morning Consult.",
  tags: ["Redirects"],
  request: {
    query: redirectSchema,
  },
  responses: {
    200: {
      description: "Redirect processed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            status: z.string(),
            payout: z.number().nullable(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad Request",
    },
    404: {
      description: "Not Found",
    },
    500: {
      description: "Internal Server Error",
    },
  },
});

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    complete: "Survey completed successfully!",
    screenout: "Thank you for trying, but you did not qualify.",
    over_quota: "This survey has reached its quota.",
    quality_term: "Survey ended due to quality check.",
    timeout: "Your session expired.",
    unknown: "Unknown status.",
  };
  return messages[status] || "Unknown status.";
}

const app = new OpenAPIHono<Env>().openapi(redirectRoute, async (c) => {
  const params = c.req.valid("query");
  const db = getDb(c);

  // Get session
  const { data: sessionData, error: sessionError } = await db
    .from("survey_sessions")
    .select("*")
    .eq("id", params.session)
    .single();

  if (sessionError || !sessionData) {
    return c.json({ error: "Session not found" }, 404);
  }

  // Get provider
  const { data: providerData, error: providerError } = await db
    .from("survey_providers")
    .select("*")
    .eq("id", sessionData.provider_id)
    .single();

  if (providerError || !providerData) {
    return c.json({ error: "Provider not found" }, 404);
  }

  const session = {
    ...sessionData,
    provider: {
      credentials: providerData.credentials,
      apiBaseUrl: providerData.api_base_url,
      supplierId: providerData.supplier_id,
    },
    userId: sessionData.user_id,
  };

  // Get MC public key
  let mcPublicKey: string;
  try {
    const mcClient = new MorningConsultClient({
      apiKey: session.provider.credentials,
      baseUrl: session.provider.apiBaseUrl,
      supplierId: session.provider.supplierId || "",
    });
    mcPublicKey = await mcClient.getPublicKey();
  } catch (error) {
    console.error("Failed to get MC public key:", error);
    return c.json({ error: "Failed to verify signature" } as any, 500);
  }

  // Verify signature
  const isValid = verifyRedirectSignature(
    {
      status: params.status,
      session: params.session,
      payout: params.payout,
      statusId: params.status_id,
      statusDetailId: params.status_detail_id,
      signature: params.signature,
    },
    mcPublicKey,
  );

  if (!isValid) {
    console.error("Invalid redirect signature", { sessionId: params.session });
    return c.json({ error: "Invalid signature" }, 400);
  }

  // Update session
  const actualPayout = params.payout ? parseInt(params.payout, 10) : null;

  await db
    .from("survey_sessions")
    .update({
      status: params.status,
      status_detail: params.status_detail_id ?? null,
      actual_payout: actualPayout,
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.session);

  // Credit user wallet if complete
  if (params.status === "complete" && actualPayout) {
    try {
      // Get user
      const { data: user, error: userError } = await db
        .from("users")
        .select("*")
        .eq("id", session.userId)
        .single();

      if (user && !userError) {
        // Convert cents to dollars
        const amountDollars = actualPayout / 100;

        // Update wallet balance
        await db
          .from("users")
          .update({
            wallet_balance: (user.wallet_balance || 0) + amountDollars,
          })
          .eq("id", session.userId);

        // Create transaction record
        await db.from("wallet_transactions").insert({
          user_id: session.userId,
          session_id: params.session,
          amount_dollars: amountDollars,
          type: "survey_payout",
          description: "Morning Consult survey completion",
          metadata: {
            bid_id: session.bid_id,
            external_payout_cents: actualPayout,
          },
        });
      }
    } catch (error) {
      console.error("Failed to credit wallet:", error);
      // Don't fail the redirect if wallet credit fails
    }
  }

  // Redirect to frontend
  const frontendUrl = c.env.FRONTEND_URL || "http://localhost:3001";
  const redirectUrl = new URL(`${frontendUrl}/surveys/redirect/${params.status}`);
  if (actualPayout) {
    redirectUrl.searchParams.set("payout", actualPayout.toString());
  }
  
  return c.redirect(redirectUrl.toString());
});

export default app;
