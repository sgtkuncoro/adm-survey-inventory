"use client";

import { useState, useMemo } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useAdminSurveys, useAdminSurveyQuotas, useAdminStats } from "@/hooks/use-surveys";
import { useAdminProviders } from "@/hooks/use-admin";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RefreshCw, Eye, Search, Clock, Users, DollarSign, Activity } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// Types
// ============================================================================

interface Survey {
  id: string;
  externalBidId: string;
  provider?: { name: string };
  cpiCents: number;
  isActive: boolean;
  updatedAt: string;
  country?: string;
  topic?: string;
  loiMinutes?: number;
  languageIds?: string[];
  quotaCount?: number;
  fillProgress?: number;
}

interface Quota {
  id: string;
  externalQuotaId: string;
  cpiCents: number;
  loiMinutes?: number;
  completesRequired?: number;
  completesCurrent?: number;
  isOpen?: boolean;
  quota_qualifications?: { questionId: string; answers: string[] }[];
}

// ... QuotaBreakdown component ...

// ... (skipping QuotaBreakdown implementation to keep chunk small if possible, but replace_file_content needs contiguous block)
// I will target the columns definitions specifically.

// Wait, replace_file_content replaces a contiguous block. I need to be careful.
// I'll update the Interface first.


// ============================================================================
// Quota Breakdown Component
// ============================================================================

function QuotaBreakdown({ surveyId, languageIds }: { surveyId: string; languageIds?: string[] }) {
  const { data, isLoading, error } = useAdminSurveyQuotas(surveyId);

  const formatLanguage = (codes?: string[]): string => {
    if (!codes?.length) return "—";
    return codes.map(l => {
      if (l === "en" || l === "1") return "English";
      if (l === "es" || l === "2") return "Spanish";
      if (l === "fr") return "French";
      if (l === "de") return "German";
      return l.toUpperCase();
    }).join(", ");
  };

  const getGender = (qualifications?: { questionId: string; answers: string[] }[]): string | null => {
    const genderQual = qualifications?.find(q => ["gender", "GENDER"].includes(q.questionId));
    if (!genderQual?.answers?.length) return null;
    const a = genderQual.answers[0];
    if (["1", "male", "M"].includes(a.toLowerCase()) || a === "1") return "Male";
    if (["2", "female", "F"].includes(a.toLowerCase()) || a === "2") return "Female";
    return a;
  };

  const getAgeRange = (qualifications?: { questionId: string; answers: string[] }[]): string | null => {
    const ageQual = qualifications?.find(q => ["age", "AGE", "age_range"].includes(q.questionId));
    if (!ageQual?.answers?.length) return null;
    const ages = ageQual.answers.map(a => parseInt(a)).filter(a => !isNaN(a));
    if (!ages.length) return ageQual.answers.join(", ");
    return `${Math.min(...ages)}-${Math.max(...ages)}`;
  };

  const columns = useMemo<ColumnDef<Quota>[]>(() => [
    {
      accessorKey: "id",
      header: "Quota ID",
      cell: ({ row }) => <span className="font-mono text-xs text-gray-500">{row.original.externalQuotaId || row.original.id.slice(0, 8)}</span>
    },
    {
      id: "gender",
      header: "Gender",
      cell: ({ row }) => {
         const gender = getGender(row.original.quota_qualifications);
         return gender ? (
             <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${gender === "Female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>{gender}</span>
         ) : <span className="text-gray-400">—</span>;
      }
    },
    {
      id: "age",
      header: "Age Range",
      cell: ({ row }) => <span className="text-gray-700">{getAgeRange(row.original.quota_qualifications) || "—"}</span>
    },
    {
      id: "language",
      header: "Language",
      cell: () => <span className="text-gray-700">{formatLanguage(languageIds)}</span>
    },
    {
       accessorKey: "cpiCents",
       header: "CPI",
       cell: ({ row }) => <span className="text-emerald-600 font-semibold">${(row.original.cpiCents / 100).toFixed(2)}</span>
    },
    {
      id: "needed",
      header: "Needed",
      cell: ({ row }) => (
         <span className="text-gray-700">
            {typeof row.original.completesRequired === 'number' ? (
              <span>{row.original.completesCurrent || 0} / {row.original.completesRequired}</span>
            ) : "∞"}
         </span>
      )
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
         row.original.isOpen !== false ? 
         <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-medium">Open</Badge> :
         <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none">Closed</Badge>
      )
    }
  ], [languageIds]);

  if (isLoading) return <div className="py-4 text-center text-sm text-gray-500">Loading quotas...</div>;
  if (error || !data?.quotas?.length) return <div className="py-4 text-center text-sm text-gray-500">No quotas available</div>;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-none animate-in fade-in slide-in-from-top-2 duration-200">
      <h4 className="font-bold text-gray-900 mb-4 text-base">Quota Breakdown</h4>
      <DataTable
        columns={columns}
        data={data.quotas}
        isLoading={isLoading}
        enablePagination={true}
        initialPageSize={10}
        emptyMessage="No quotas found"
      />
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function SurveysPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [providerId, setProviderId] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("all");

  // Custom filters matching HTML dashboard
  const [cpiRange, setCpiRange] = useState<string>("any");
  const [loiRange, setLoiRange] = useState<string>("any");

  // Derive API filters from state
  const apiFilters = useMemo(() => {
    let minCpi: number | undefined;
    let minLoi: number | undefined;
    let maxLoi: number | undefined;

    if (cpiRange === "3.00+") minCpi = 3;
    else if (cpiRange === "3.50+") minCpi = 3.5;
    else if (cpiRange === "4.00+") minCpi = 4;

    if (loiRange === "under20") maxLoi = 19;
    else if (loiRange === "20-30") { minLoi = 20; maxLoi = 30; }
    else if (loiRange === "30+") minLoi = 30;

    return { minCpi, minLoi, maxLoi };
  }, [cpiRange, loiRange]);

  const { data: surveysData, isLoading, refetch } = useAdminSurveys({
    page,
    limit,
    providerId: providerId || undefined,
    isActive: isActive === "all" ? undefined : isActive === "true",
    ...apiFilters
  });

  const { data: providers } = useAdminProviders();
  const { data: stats } = useAdminStats();

  const surveys = surveysData?.surveys || [];
  const total = surveysData?.total || 0;

  const columns = useMemo<ColumnDef<Survey, unknown>[]>(() => [
    {
      accessorKey: "provider",
      header: "Provider",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
          {row.original.provider?.name || "Unknown"}
        </Badge>
      ),
    },
    {
      accessorKey: "externalBidId",
      header: "Survey ID",
      cell: ({ row }) => <span className="font-mono text-sm text-gray-500">{row.original.externalBidId?.slice(0, 12)}...</span>,
    },
    {
      accessorKey: "topic",
      header: "Topic",
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.topic || "General"}</span>,
    },
    {
      accessorKey: "loiMinutes",
      header: "Length",
      cell: ({ row }) => {
        const min = row.original.loiMinutes;
        return <span className={`text-sm ${min && min > 30 ? "text-orange-600" : "text-gray-700"}`}>
          {min ? `${min} min` : "—"}
        </span>;
      },
    },
    {
      accessorKey: "cpiCents",
      header: "CPI",
      cell: ({ row }) => (
        <span className="text-emerald-600 font-bold">
          ${(row.original.cpiCents / 100).toFixed(2)}
        </span>
      ),
    },
    {
      id: "quotas",
      header: "Quotas",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-normal">
          {row.original.quotaCount || 0} quotas
        </Badge>
      ),
    },
    {
      id: "progress",
      header: "Fill Progress",
      cell: ({ row }) => {
        const progress = row.original.fillProgress || 0;
        return (
          <div className="flex items-center gap-3 w-32">
            <Progress value={progress} className="h-1.5 bg-gray-100" variant="success" />
            <span className="text-xs text-gray-500 w-8">{Math.round(progress)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        row.original.isActive ? 
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Open</Badge> : 
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none">Closed</Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "",
      cell: ({ row }) => (
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(row.original.updatedAt), { addSuffix: true })}
        </span>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Survey Inventory</h1>
          <p className="text-gray-500 mt-1">External survey opportunities from API providers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-orange-400 animate-pulse' : 'bg-emerald-500'}`} />
            Last synced: {stats?.lastSync ? formatDistanceToNow(new Date(stats.lastSync), { addSuffix: true }) : 'Never'}
          </div>
          <Button onClick={() => refetch()} className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="shadow-none border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600 font-normal shadow-none border-none">+3 new</Badge>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.openSurveys || 0}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Active Surveys</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">${(stats?.avgCpi || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Avg CPI</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{(stats?.totalSlots || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Total Slots Available</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{Math.round(stats?.avgLoi || 0)} min</div>
            <div className="text-sm text-gray-500 mt-1 font-medium">Avg Survey Length</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-none border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Provider Filter */}
              <select 
                className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                value={providerId}
                onChange={(e) => { setProviderId(e.target.value); setPage(1); }}
              >
                <option value="">All Providers</option>
                {providers?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select 
                className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                value={isActive}
                onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
              >
                <option value="all">All Status</option>
                <option value="true">Open</option>
                <option value="false">Closed</option>
              </select>

              {/* CPI Filter */}
              <select 
                className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                value={cpiRange}
                onChange={(e) => { setCpiRange(e.target.value); setPage(1); }}
              >
                <option value="any">Any CPI</option>
                <option value="3.00+">$3.00+</option>
                <option value="3.50+">$3.50+</option>
                <option value="4.00+">$4.00+</option>
              </select>

              {/* Length Filter */}
              <select 
                className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                value={loiRange}
                onChange={(e) => { setLoiRange(e.target.value); setPage(1); }}
              >
                <option value="any">Any Length</option>
                <option value="under20">Under 20 min</option>
                <option value="20-30">20-30 min</option>
                <option value="30+">30+ min</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                type="text" 
                placeholder="Search by ID or topic..." 
                className="pl-9 bg-gray-50 border-gray-200 w-64 focus-visible:ring-pink-500/20 focus-visible:border-pink-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-none border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={surveys}
          isLoading={isLoading}
          emptyMessage="No surveys found."
          getRowId={(row) => row.id}
          renderSubComponent={({ row }: { row: Row<Survey> }) => (
            <QuotaBreakdown surveyId={row.original.id} languageIds={row.original.languageIds} />
          )}
          enablePagination={false}
        />
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-900">{total}</span> surveys
        </div>
        <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="border-gray-200 text-gray-500"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <Button size="sm" className="bg-pink-500 text-white hover:bg-pink-600">{page}</Button>
              {page * limit < total && (
                <Button size="sm" variant="ghost" onClick={() => setPage(p => p + 1)} className="text-gray-500 hover:bg-gray-50 border border-gray-200">{page + 1}</Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total || isLoading}
              className="border-gray-200 text-gray-500"
            >
              Next
            </Button>
        </div>
      </div>
    </div>
  );
}
