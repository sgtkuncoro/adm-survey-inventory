"use client";

import { useParams } from "next/navigation";
import { useAdminProviderLegend, useAdminProvider } from "@/hooks/use-admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function ProviderLegendPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: provider, isLoading: isProviderLoading } = useAdminProvider(id);
  const { data: legend, isLoading: isLegendLoading, error } = useAdminProviderLegend(id);

  if (isProviderLoading || isLegendLoading) {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/providers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Qualification Legend</h1>
          <p className="text-muted-foreground">
            Known qualification questions for <span className="font-semibold text-foreground">{provider?.name}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            These questions are auto-discovered from survey inventory syncs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question ID</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>Answer Options</TableHead>
                <TableHead>Last Saw</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legend?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.question_id}</TableCell>
                  <TableCell className="text-sm">
                    {item.question_text || <span className="text-muted-foreground italic">Unknown</span>}
                  </TableCell>
                  <TableCell>
                    {item.answer_options ? (
                      <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                        {Object.entries(item.answer_options).map(([key, label]: [string, any]) => (
                          <div key={key} className="flex gap-2">
                             <code className="bg-muted px-1 rounded">{key}</code>
                             <span>{String(label)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">No options mapped</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {item.updated_at ? formatDistanceToNow(new Date(item.updated_at), { addSuffix: true }) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {legend?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No qualification questions found yet.
                    <br />
                    <span className="text-muted-foreground text-sm">Run a sync to discover qualifications.</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
