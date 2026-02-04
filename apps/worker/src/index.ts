import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { createWorkerClient, TypedSupabaseClient } from "@packages/supabase";
import surveyRoutes from "./routes/surveys";
import redirectRoutes from "./routes/redirect";
import adminRoutes from "./routes/admin";

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ENCRYPTION_KEY: string;
};

type Variables = {
  db: TypedSupabaseClient;
  user: any;
};

type Env = {
  Bindings: Bindings;
  Variables: Variables;
};

const app = new OpenAPIHono<Env>();

app.onError((err, c) => {
  console.error("App Error:", err);
  return c.json(
    {
      error: String(err),
      message: err instanceof Error ? err.message : "Unknown error",
    },
    500,
  );
});

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*", // Configure for production
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Database middleware
app.use("/api/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const headers = authHeader ? { Authorization: authHeader } : undefined;
  const supabase = createWorkerClient(c.env, headers);
  c.set("db", supabase);
  await next();
});

// Health check
app.get("/", (c) => {
  return c.json({
    message: "ShopperArmy Survey API",
    version: "1.0.0",
    status: "healthy",
  });
});

// API routes
const routes = app
  .route("/api/surveys", surveyRoutes)
  .route("/api/surveys", redirectRoutes)
  .route("/api/admin", adminRoutes);

// Export type for client
export type AppType = typeof routes;

// OpenAPI Docs
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "ShopperArmy Survey Inventory API",
  },
});

app.get(
  "/ui",
  apiReference({
    spec: {
      url: "/doc",
    },
  } as any),
);

import { syncSurveyInventory } from "./lib/surveys/sync";

export default {
  fetch: app.fetch,
  async scheduled(event: any, env: Bindings, ctx: any) {
    console.log("Starting scheduled survey sync...");
    const supabase = createWorkerClient(env);
    await syncSurveyInventory(supabase);
    console.log("Scheduled survey sync completed.");
  },
};
