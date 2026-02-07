import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };
import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
} from "@supabase/ssr";

// Generic Bindings interface - extensible by apps
export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

// Placeholder for generated Database types
// Placeholder for generated Database types
// Run `npx supabase gen types typescript` to populate this
export type Database = any;

export type TypedSupabaseClient = SupabaseClient<Database, "public">;

/**
 * Creates a Supabase client for use in Cloudflare Workers / Hono.
 * Requires passing the environment variables (Bindings) from the request context.
 */
export const createWorkerClient = (
  env: SupabaseEnv,
  headers?: Record<string, string>,
) => {
  return createClient<Database, "public">(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: headers,
      },
      auth: {
        persistSession: false, // Workers are stateless
      },
      db: {
        schema: "public",
      },
    },
  );
};

/**
 * Creates a Supabase client with Service Role privileges.
 * WARNING: specific for backend/admin tasks only.
 */
export const createAdminClient = (env: SupabaseEnv) => {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing in environment bindings",
    );
  }
  return createClient<Database, "public">(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    },
  );
};

/**
 * Creates a Browser Client for client-side components.
 * Singleton-ish behavior handled by the library.
 */
export const createBrowserClient = (env: SupabaseEnv, options: any = {}) => {
  return _createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    db: {
      schema: "public",
    },
    ...options,
  });
};

/**
 * Creates a Server Client for RSC/Middleware/Actions.
 * Requires a generic cookie adapter to be passed from the framework (e.g. Next.js cookies()).
 */
export const createServerClient = (
  env: SupabaseEnv,
  cookieAdapter: {
    getAll: () => any;
    setAll: (cookies: any[]) => void;
  },
  options: any = {},
) => {
  // console.log("Creating Server Client", { supabaseUrl: env.SUPABASE_URL, hasKey: !!env.SUPABASE_ANON_KEY, fn: typeof _createServerClient });
  if (typeof _createServerClient !== "function") {
    console.error(
      "CRITICAL: @supabase/ssr createServerClient is not a function!",
      _createServerClient,
    );
  }
  return _createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: cookieAdapter,
    db: {
      schema: "public",
    },
    ...options,
  });
};
