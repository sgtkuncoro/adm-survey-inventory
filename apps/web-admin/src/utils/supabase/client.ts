import { createBrowserClient as createClient } from "@packages/supabase";

export function createBrowserClient() {
  return createClient({
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }, {
    cookieOptions: {
      name: "sb-admin-session",
    },
  });
}
