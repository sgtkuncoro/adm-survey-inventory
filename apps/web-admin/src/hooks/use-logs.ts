import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { createBrowserClient } from "@/utils/supabase/client";

export type LogFilters = {
  page?: number;
  limit?: number;
  providerId?: string;
  status?: "error" | "success" | "all";
  method?: string;
  syncJobId?: string;
};

export function useAdminLogs(filters: LogFilters = {}) {
  return useQuery({
    queryKey: ["admin", "logs", filters],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const queryParams: any = { ...filters };
      if (queryParams.page) queryParams.page = queryParams.page.toString();
      if (queryParams.limit) queryParams.limit = queryParams.limit.toString();

      // @ts-ignore - Hono client types might not be updated yet
      const res = await client.api.admin.logs.$get(
        {
          query: queryParams,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch logs");
      }
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10s to see live logs during sync
  });
}
