import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as _createBrowserClient, createServerClient as _createServerClient, type CookieMethods } from '@supabase/ssr';

// Generic Bindings interface - extensible by apps
export type SupabaseEnv = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

// Placeholder for generated Database types
// Run `npx supabase gen types typescript` to populate this
export type Database = any; 

/**
 * Creates a Supabase client for use in Cloudflare Workers / Hono.
 * Requires passing the environment variables (Bindings) from the request context.
 */
export const createWorkerClient = (env: SupabaseEnv, headers?: Record<string, string>) => {
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: headers,
      },
      auth: {
        persistSession: false, // Workers are stateless
      }
    }
  );
};

/**
 * Creates a Supabase client with Service Role privileges.
 * WARNING: specific for backend/admin tasks only.
 */
export const createAdminClient = (env: SupabaseEnv) => {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in environment bindings");
  }
  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
};

/**
 * Creates a Browser Client for client-side components.
 * Singleton-ish behavior handled by the library.
 */
export const createBrowserClient = (env: SupabaseEnv) => {
  return _createBrowserClient<Database>(
    env.SUPABASE_URL, 
    env.SUPABASE_ANON_KEY
  );
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
  }
) => {
  return _createServerClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: cookieAdapter,
    }
  );
};

