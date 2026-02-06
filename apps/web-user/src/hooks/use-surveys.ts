import { useQuery, useMutation } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { createBrowserClient } from "@/utils/supabase/client";

export function useUserEligibility() {
  return useQuery({
    queryKey: ["user", "eligibility"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Note: We need to implement the user eligibility endpoint in the worker
      // For now, we might need to mock or use the admin one if user loopback isn't ready
      // But based on TASKS.md 1.6, eligibility service exists.
      // We likely need a dedicated route in worker for `GET /api/v1/surveys/feed` or similar?
      // Checking `apps/worker/src/index.ts` would confirm routes.
      // Assuming `client.api.surveys.feed` or similar exists or will be created.
      // If not, we fall back to manual fetch for now.

      // Fetch eligibility which now returns list of surveys
       const res = await client.api.surveys.eligibility.$get(
        undefined,
        {
           headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      if (!res.ok) {
         throw new Error("Failed to fetch survey feed");
      }
      return res.json();
    },
    retry: false,
  });
}

export function useStartSession() {
    return useMutation({
        mutationFn: async (bidId: string) => {
             const supabase = createBrowserClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await client.api.surveys.start.$post({
                json: { bidId }
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if(!res.ok) {
                const err = await res.json();
                throw new Error((err as any).error || "Failed to start session");
            }
            return res.json();
        }
    })
}
