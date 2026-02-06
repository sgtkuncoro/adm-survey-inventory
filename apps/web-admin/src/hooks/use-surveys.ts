import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { createBrowserClient } from "@/utils/supabase/client";

export type SurveyFilters = {
  page?: number;
  limit?: number;
  providerId?: string;
  minCpi?: number;
  maxCpi?: number;
  minLoi?: number;
  maxLoi?: number;
  isActive?: boolean;
  country?: string;
};

export function useAdminSurveys(filters: SurveyFilters = {}) {
  return useQuery({
    queryKey: ["admin", "surveys", filters],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Construct query params manually or use Hono client if it supports object to query string
      // Hono RPC client (hc) typically handles object params for query()
      const queryParams: any = { ...filters };
      if (queryParams.page) queryParams.page = queryParams.page.toString();
      if (queryParams.limit) queryParams.limit = queryParams.limit.toString();
      if (queryParams.minCpi) queryParams.minCpi = queryParams.minCpi.toString();
      if (queryParams.maxCpi) queryParams.maxCpi = queryParams.maxCpi.toString();
      if (queryParams.minLoi) queryParams.minLoi = queryParams.minLoi.toString();
      if (queryParams.maxLoi) queryParams.maxLoi = queryParams.maxLoi.toString();
      if (queryParams.isActive !== undefined) queryParams.isActive = queryParams.isActive.toString();

      const res = await client.api.admin.surveys.$get(
        {
          query: queryParams,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch surveys");
      }
      return res.json();
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // @ts-ignore - Hono client type might lag behind
      const res = await client.api.admin.stats.$get(
        undefined,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      return res.json();
    },
  });
}

export function useAdminSurvey(id: string) {
  return useQuery({
    queryKey: ["admin", "surveys", id],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.surveys[":id"].$get(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch survey details");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useAdminSurveyQuotas(id: string) {
  return useQuery({
    queryKey: ["admin", "surveys", id, "quotas"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.surveys[":id"].quotas.$get(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch survey quotas");
      }
      return res.json();
    },
    enabled: !!id,
  });
}
