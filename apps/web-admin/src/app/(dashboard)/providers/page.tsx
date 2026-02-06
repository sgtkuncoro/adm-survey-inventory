"use client";

import { useAdminProviders } from "@/hooks/use-admin";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, RefreshCw, Settings2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ProvidersPage() {
  const { data: providers, isLoading, error } = useAdminProviders();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">Survey Providers</h1>
          <p className="text-sm text-muted-foreground">Manage external survey integrations.</p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Sync Inventory
        </Button>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sync Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers?.map((provider: any) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell>
                  {provider.isActive ? (
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {provider.slug}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {provider.updatedAt
                    ? formatDistanceToNow(new Date(provider.updatedAt), {
                        addSuffix: true,
                      })
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/providers/${provider.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                      <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {providers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                  No providers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
