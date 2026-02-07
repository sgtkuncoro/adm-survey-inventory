"use client";

import { useState, useMemo } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useAdminLogs } from "@/hooks/use-logs";
import { useAdminProviders } from "@/hooks/use-admin";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Eye, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definition for Log based on API response
type ApiLog = {
  id: string;
  providerId: string | null;
  method: string;
  endpoint: string;
  requestUrl: string;
  requestHeaders: any;
  requestBody: any;
  responseStatus: number | null;
  responseBody: any;
  responseHeaders: any;
  durationMs: number | null;
  errorMessage: string | null;
  syncJobId: string | null;
  createdAt: string;
  provider?: { name: string } | null;
};

// ============================================================================
// Log Details Component (Expanded Row)
// ============================================================================

function LogDetails({ log }: { log: ApiLog }) {
  return (
    <div className="p-4 bg-muted/30 rounded-md border border-border">
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-500">Full URL:</span>
            <div className="font-mono text-xs break-all mt-1 bg-white p-2 rounded border">
              {log.requestUrl}
            </div>
          </div>
          <div>
            <span className="font-semibold text-gray-500">Error Message:</span>
            <div className="mt-1 text-red-600 font-medium">
              {log.errorMessage || "—"}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="response" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>
        <TabsContent value="request" className="space-y-4 pt-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Headers</h4>
            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(log.requestHeaders, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Body</h4>
            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto max-h-96">
              {log.requestBody ? JSON.stringify(log.requestBody, null, 2) : "No body"}
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="response" className="space-y-4 pt-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Headers</h4>
            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
              {JSON.stringify(log.responseHeaders, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Body</h4>
            <pre className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto max-h-96">
              {log.responseBody ? JSON.stringify(log.responseBody, null, 2) : "No body"}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [providerId, setProviderId] = useState<string>("");
  const [status, setStatus] = useState<"all" | "success" | "error">("all");
  const [method, setMethod] = useState<string>("");

  const { data: logsData, isLoading, error, refetch } = useAdminLogs({
    page,
    limit,
    providerId: providerId || undefined,
    status: status === "all" ? undefined : status,
    method: method || undefined,
  });

  const { data: providers } = useAdminProviders();

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;

  const columns = useMemo<ColumnDef<ApiLog, unknown>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => (
          <span className="text-gray-600 text-sm whitespace-nowrap" title={new Date(row.original.createdAt).toLocaleString()}>
            {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
          </span>
        ),
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {row.original.provider?.name || "Unknown"}
          </Badge>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => {
          const method = row.original.method.toUpperCase();
          return (
            <Badge variant={method === "GET" ? "default" : method === "POST" ? "secondary" : "outline"}>
              {method}
            </Badge>
          );
        },
      },
      {
        accessorKey: "endpoint",
        header: "Endpoint",
        cell: ({ row }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs text-gray-800 break-all">
            {row.original.endpoint}
          </code>
        ),
      },
      {
        accessorKey: "responseStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.responseStatus;
          const isError = !status || status >= 400;
          return (
            <Badge variant={isError ? "destructive" : "success"} className="flex w-fit items-center gap-1">
              {isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {status || "ERR"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "durationMs",
        header: "Duration",
        cell: ({ row }) => {
          const ms = row.original.durationMs;
          if (ms === null) return <span className="text-gray-400">—</span>;
          const isSlow = ms > 1000;
          return (
            <span className={`text-sm ${isSlow ? "text-orange-600 font-medium" : "text-gray-600"}`}>
              {ms}ms
            </span>
          );
        },
      },
    ],
    []
  );

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">API Logs</h1>
          <p className="text-sm text-muted-foreground">
            History of external API requests and sync operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {total} logs found
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="text-sm font-medium mb-1 block">Provider</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Providers</option>
              {providers?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="success">Success (2xx)</option>
              <option value="error">Error (4xx/5xx)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Method</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={logs}
            isLoading={isLoading}
            emptyMessage="No logs found."
            getRowId={(row) => row.id}
            renderSubComponent={({ row }: { row: Row<ApiLog> }) => (
              <LogDetails log={row.original} />
            )}
            enablePagination={false}
          />
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(total / limit) || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page * limit >= total || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
