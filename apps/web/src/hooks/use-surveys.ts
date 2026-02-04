"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { client } from "@/lib/api";

export function useEligibility() {
  return useQuery({
    queryKey: ["eligibility"],
    queryFn: async () => {
      const res = await client.api.surveys.eligibility.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch eligibility");
      }
      return res.json();
    },
    // Cache for 60 seconds (matches Backend TTL)
    staleTime: 60 * 1000,
  });
}

export function useStartSession() {
  return useMutation({
    mutationFn: async (bidId: string) => {
      const res = await client.api.surveys.session.$post({
        json: { bidId },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error((error as any).error || "Failed to start session");
      }

      return res.json();
    },
  });
}
