import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { createBrowserClient } from "@/utils/supabase/client";

export function useSyncJobs() {
  return useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.jobs.$get(
        undefined,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch sync jobs");
      }
      return res.json();
    },
    // Refresh every 30 seconds to catch running jobs
    refetchInterval: 30000,
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string = "survey-sync") => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.jobs.trigger.$post(
        {
          json: { jobId },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).error || "Failed to trigger sync");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });
}

export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.jobs[":id"].cancel.$post(
        {
          param: { id: jobId },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).error || "Failed to cancel job");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
    },
  });
}
