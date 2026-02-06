"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useSyncJobs, useTriggerSync, useCancelJob } from "@/hooks/use-jobs";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const JobActionCell = ({ job }: { job: any }) => {
  const { mutate: cancelJob } = useCancelJob();

  const handleCancel = () => {
    cancelJob(job.id, {
      onSuccess: () => toast.success("Job cancelled"),
      onError: (err: any) => toast.error("Failed to cancel job: " + err.message),
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will cancel the job running for provider <strong>{job.providerId ? job.providerId.substring(0,8) + "..." : "System"}</strong>. 
            This action cannot be undone and will mark the job as failed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleCancel}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Yes, cancel job
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function SyncJobsPage() {
  const { data: jobs, isLoading, error } = useSyncJobs();
  const { mutate: triggerSync, isPending: isTriggering } = useTriggerSync();

  const handleTrigger = () => {
    triggerSync("survey-sync", {
      onSuccess: () => toast.success("Sync job started"),
      onError: (err) => toast.error("Failed to start sync: " + err.message),
    });
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const startedAt = new Date(row.original.startedAt);
        const now = new Date();
        const isStalled = status === "running" && (now.getTime() - startedAt.getTime()) > 1000 * 60 * 60; 
        const isTimeout = status === "running" && (now.getTime() - startedAt.getTime()) > 1000 * 60 * 60 * 24; // 24 hours

        if (status === "success") return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300">Success</Badge>;
        if (status === "failed") return <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 shadow-none">Failed</Badge>;
        
        if (isStalled || isTimeout) {
          return <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100 hover:border-orange-300">Stalled</Badge>;
        }

        return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 animate-pulse">Running</Badge>;
      }
    },
    {
      accessorKey: "startedAt",
      header: "Started",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs font-mono">
          {formatDistanceToNow(new Date(row.original.startedAt), { addSuffix: true })}
        </span>
      )
    },
    {
      header: "Duration",
      cell: ({ row }) => {
        const job = row.original;
        if (!job.completedAt || !job.startedAt) return <span className="text-xs text-blue-500 font-medium">In Progress</span>;
        const duration = formatDuration(
          intervalToDuration({
            start: new Date(job.startedAt),
            end: new Date(job.completedAt)
          }),
          { format: ['minutes', 'seconds'] }
        ) || "< 1s";
        return <span className="text-xs text-muted-foreground font-mono">{duration}</span>;
      }
    },
    {
      header: "Stats",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs text-muted-foreground">
           <span>{row.original.itemsProcessed || 0} processed</span>
           <span>{row.original.itemsModified || 0} modified</span>
        </div>
      )
    },
    {
      accessorKey: "providerId",
      header: "Provider",
      cell: ({ row }) => row.original.providerId ? (
        <span className="text-xs font-medium font-mono text-muted-foreground">{row.original.providerId.substring(0,8)}</span>
      ) : (
        <span className="text-xs text-muted-foreground">All / System</span>
      )
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground max-w-xs truncate block" title={row.original.message}>
          {row.original.message || "-"}
        </span>
      )
    },
    {
      id: "actions",
      header: ({ column }) => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "running") {
          return (
            <div className="text-right">
              <JobActionCell job={row.original} />
            </div>
          );
        }
        return null;
      }
    }
  ], []);

  if (error) {
    // ... error handling
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Sync History</h1>
          <p className="text-sm text-muted-foreground">
            Logs of automated and manual survey inventory syncs.
          </p>
        </div>
        <Button onClick={handleTrigger} disabled={isTriggering} size="sm" className="h-8 text-xs shadow-none">
          <Play className={`mr-2 h-3.5 w-3.5 ${isTriggering ? "animate-spin" : ""}`} />
          {isTriggering ? "Starting..." : "Trigger Sync Now"}
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <DataTable
          columns={columns}
          data={jobs || []}
          isLoading={isLoading}
          emptyMessage="No sync logs found. Trigger a sync to get started."
          initialPageSize={20}
        />
      </div>
    </div>
  );
}
