"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useAdminSurvey, useAdminSurveyQuotas } from "@/hooks/use-surveys";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowLeft, Loader2, ChevronDown, Code } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface Qualification {
  questionId: string;
  answers: string[];
}

interface Quota {
  id: string;
  surveyId: string;
  externalQuotaId: string;
  cpiCents: number;
  loiMinutes?: number;
  // Quota statistics from MC API
  completesRequired?: number; // Total target (Needed)
  completesCurrent?: number;  // Current completions (Filled)
  isOpen?: boolean;
  createdAt: string;
  updatedAt: string;
  quota_qualifications?: Qualification[];
}

// ============================================================================
// Helper functions to extract qualification data
// ============================================================================

function getGender(qualifications?: Qualification[]): string | null {
  const genderQual = qualifications?.find(
    (q) => q.questionId === "gender" || q.questionId === "GENDER"
  );
  if (!genderQual?.answers?.length) return null;
  
  const answer = genderQual.answers[0];
  // Common mappings
  if (answer === "1" || answer.toLowerCase() === "male" || answer === "M") return "Male";
  if (answer === "2" || answer.toLowerCase() === "female" || answer === "F") return "Female";
  return answer;
}

function getAgeRange(qualifications?: Qualification[]): string | null {
  const ageQual = qualifications?.find(
    (q) => q.questionId === "age" || q.questionId === "AGE" || q.questionId === "age_range"
  );
  if (!ageQual?.answers?.length) return null;
  
  const ages = ageQual.answers.map((a) => parseInt(a)).filter((a) => !isNaN(a));
  if (ages.length === 0) return ageQual.answers.join(", ");
  
  const minAge = Math.min(...ages);
  const maxAge = Math.max(...ages);
  return `${minAge}-${maxAge}`;
}

function formatLanguage(codes?: string[]): string {
  if (!codes?.length) return "—";
  return codes.map(l => {
    if (l === "en" || l === "1") return "English";
    if (l === "es" || l === "2") return "Spanish";
    if (l === "fr") return "French";
    if (l === "de") return "German";
    return l.toUpperCase();
  }).join(", ");
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function SurveyDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: survey,
    isLoading: isSurveyLoading,
    error: surveyError,
  } = useAdminSurvey(id);
  const {
    data: quotasData,
    isLoading: isQuotasLoading,
    error: quotasError,
  } = useAdminSurveyQuotas(id);

  // Column definitions for quota breakdown table
  const columns = useMemo<ColumnDef<Quota, unknown>[]>(
    () => [
      {
        accessorKey: "externalQuotaId",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quota ID</span>,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-gray-500">
            {row.original.externalQuotaId}
          </span>
        ),
      },
      {
        id: "gender",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</span>,
        cell: ({ row }) => {
          const gender = getGender(row.original.quota_qualifications);
          if (!gender) return <span className="text-gray-400">—</span>;
          return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              gender === "Female" 
                ? "bg-pink-100 text-pink-700" 
                : "bg-blue-100 text-blue-700"
            }`}>
              {gender}
            </span>
          );
        },
      },
      {
        id: "ageRange",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age Range</span>,
        cell: ({ row }) => {
          const ageRange = getAgeRange(row.original.quota_qualifications);
          return (
            <span className="text-gray-700 text-sm">
              {ageRange || "—"}
            </span>
          );
        },
      },
      {
        id: "language",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</span>,
        cell: ({ row }) => {
          return (
            <span className="text-gray-700 text-sm">
              {formatLanguage(survey?.languageIds)}
            </span>
          );
        },
      },
      {
        accessorKey: "cpiCents",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CPI</span>,
        cell: ({ row }) => (
          <span className="text-emerald-600 font-semibold text-sm">
            ${(row.original.cpiCents / 100).toFixed(2)}
          </span>
        ),
      },
      {
        id: "needed",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Needed</span>,
        cell: ({ row }) => {
          const needed = row.original.completesRequired;
          return (
            <span className="text-gray-700 text-sm">
              {needed ?? "—"}
            </span>
          );
        },
      },
      {
        id: "filled",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filled</span>,
        cell: ({ row }) => {
          const filled = row.original.completesCurrent;
          return (
            <span className="text-gray-700 text-sm">
              {filled ?? "—"}
            </span>
          );
        },
      },
      {
        id: "status",
        header: () => <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>,
        cell: ({ row }) => (
          row.original.isOpen !== false ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
              Open
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              Closed
            </span>
          )
        ),
      },
    ],
    [survey]
  );

  if (isSurveyLoading || isQuotasLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (surveyError) {
    return <div className="p-8 text-red-500">Error: {surveyError.message}</div>;
  }

  const quotas = quotasData?.quotas || quotasData || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/surveys">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-mono">{survey?.externalBidId}</h1>
          <p className="text-muted-foreground">
            Provided by{" "}
            <span className="font-semibold text-foreground">
              {survey?.provider?.name}
            </span>
          </p>
        </div>
        <div className="ml-auto">
          {survey?.isActive ? (
            <Badge variant="success" className="text-base px-4 py-1">
              Active
            </Badge>
          ) : (
            <Badge variant="gray" className="text-base px-4 py-1">
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Survey Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">CPI</div>
              <div className="text-2xl font-bold text-green-600">
                ${(survey?.cpiCents / 100).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Quotas
              </div>
              <div className="text-2xl font-bold">{quotas.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Last Updated
              </div>
              <div className="text-sm">
                {survey?.updatedAt
                  ? formatDistanceToNow(new Date(survey.updatedAt), {
                      addSuffix: true,
                    })
                  : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Internal ID
              </div>
              <div className="text-xs font-mono text-muted-foreground break-all">
                {survey?.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quota Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quota Breakdown</CardTitle>
          <CardDescription>
            Target groups and specific requirements for this survey.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {quotasError ? (
            <div className="text-red-500 text-sm p-6">Failed to load quotas</div>
          ) : (
            <DataTable
              columns={columns}
              data={quotas}
              getRowId={(row) => row.id}
              emptyMessage="No quotas found for this survey."
              enablePagination={quotas.length > 10}
              initialPageSize={20}
            />
          )}
        </CardContent>
      </Card>

      {/* Raw Provider Data (Collapsible) */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 text-gray-500">
            <ChevronDown className="h-4 w-4" />
            <Code className="h-4 w-4" />
            View Raw Provider Data
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="p-4">
              <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify({ survey, quotas }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
