"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Fetch stats from Worker API
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await client.api.admin.stats.$get();
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    },
    refetchInterval: 30000,
  });

  // Manual Sync Mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.admin.jobs.trigger.$post({
        json: { jobId: "survey-sync" },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).error || "Sync failed");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Sync triggered successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
    onError: (err) => {
      toast.error(`Sync failed: ${err.message}`);
    },
  });

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-red-500">
          <AlertCircle className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of survey inventory and system status.
          </p>
        </div>
        <Button 
          onClick={() => syncMutation.mutate()} 
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
          {syncMutation.isPending ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-20" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Surveys
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all providers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Surveys
                  </CardTitle>
                   <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openSurveys}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently open for participation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotas</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuotas}</div>
                  <p className="text-xs text-muted-foreground">
                    Target demographics tracked
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Sync
                  </CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.lastSync 
                      ? new Date(stats.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "Never"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.lastSync 
                      ? new Date(stats.lastSync).toLocaleDateString() 
                      : "No successful sync logs found"}
                  </p>
                </CardContent>
              </Card>
            </>
          )
        )}
      </div>
    </div>
  );
}
