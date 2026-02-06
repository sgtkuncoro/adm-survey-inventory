import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { createBrowserClient } from "@/utils/supabase/client";

export function useAdminProviders() {
  return useQuery({
    queryKey: ["admin", "providers"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers.$get(undefined, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error("Failed to fetch providers");
      }
      return res.json();
    },
  });
}

export function useAdminProvider(id: string) {
  return useQuery({
    queryKey: ["admin", "providers", id],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"].$get(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        throw new Error("Failed to fetch provider");
      }
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: any; // Type should be inferred from client ideally
    }) => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"].$put(
        {
          param: { id },
          json: updates,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        throw new Error("Failed to update provider");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "providers"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "providers", data.id],
      });
    },
  });
}

export function useGenerateKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"]["generate-key"].$post(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        throw new Error("Failed to generate key");
      }
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "providers", id] });
    },
  });
}

export function useRegisterKey() {
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"]["register-key"].$post(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error((error as any).error || "Failed to register key");
      }
      return res.json();
    },
  });
}

export function useSetRedirects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      redirects,
    }: {
      id: string;
      redirects: Record<string, string>;
    }) => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"][
        "set-redirects"
      ].$post(
        {
          param: { id },
          json: redirects,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) {
        throw new Error("Failed to set redirects");
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "providers", id] });
    },
  });
}
export function useAdminProviderLegend(id: string) {
  return useQuery({
    queryKey: ["admin", "providers", id, "legend"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await client.api.admin.providers[":id"].legend.$get(
        {
          param: { id },
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch provider legend");
      }
      return res.json();
    },
    enabled: !!id,
  });
}
