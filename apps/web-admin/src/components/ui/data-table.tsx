"use client";

import * as React from "react";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

export interface DataTableProps<TData> {
  /** Column definitions for the table */
  columns: ColumnDef<TData, unknown>[];
  /** Data array to display */
  data: TData[];
  /** Function to render expanded sub-row content */
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  /** Callback when row is clicked (optional) */
  onRowClick?: (row: Row<TData>) => void;
  /** Enable/disable pagination (default: true) */
  enablePagination?: boolean;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Initial page size */
  initialPageSize?: number;
  /** Callback when row expansion changes */
  onExpandedChange?: (expanded: ExpandedState) => void;
  /** Getter function for row ID (for expansion tracking) */
  getRowId?: (row: TData, index: number) => string;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

// ============================================================================
// DataTable Component
// ============================================================================

export function DataTable<TData>({
  columns,
  data,
  renderSubComponent,
  onRowClick,
  enablePagination = true,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  onExpandedChange,
  getRowId,
  isLoading = false,
  emptyMessage = "No results found.",
}: DataTableProps<TData>) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  // If we have a sub-component renderer, we add an expander column
  const expanderColumn: ColumnDef<TData, unknown> | null = renderSubComponent
    ? {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            >
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-400 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-90"
                )}
              />
            </button>
          ) : null;
        },
        size: 40,
      }
    : null;

  const allColumns = React.useMemo(() => {
    const cols = [...columns];
    if (expanderColumn) {
      cols.push(expanderColumn);
    }
    return cols;
  }, [columns, expanderColumn]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      expanded,
    },
    onExpandedChange: (updater) => {
      const newExpanded =
        typeof updater === "function" ? updater(expanded) : updater;
      setExpanded(newExpanded);
      onExpandedChange?.(newExpanded);
    },
    getRowCanExpand: () => !!renderSubComponent,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getRowId,
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  return (
    <div className="w-full">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-gray-100 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-pink-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  {/* Main Row */}
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-gray-50 transition-colors",
                      renderSubComponent && "cursor-pointer",
                      row.getIsExpanded() && "bg-gray-50/50"
                    )}
                    onClick={() => {
                      if (renderSubComponent) {
                        row.toggleExpanded();
                      }
                      onRowClick?.(row);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Expanded Sub-Row */}
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="p-0"
                      >
                        <div className="p-6">
                          {renderSubComponent({ row })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          {/* Page info */}
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length
              )}
            </span>{" "}
            of <span className="font-medium text-gray-900">{data.length}</span>{" "}
            results
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm font-medium"
            >
              Previous
            </Button>

            {/* Page numbers */}
            {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
              (pageIndex) => {
                // Only show first 3 pages, current page area, and last page
                const currentPage = table.getState().pagination.pageIndex;
                const totalPages = table.getPageCount();
                const showPage =
                  pageIndex < 3 ||
                  pageIndex === totalPages - 1 ||
                  Math.abs(pageIndex - currentPage) <= 1;

                if (!showPage) {
                  // Show ellipsis
                  if (pageIndex === 3 || pageIndex === totalPages - 2) {
                    return (
                      <span key={pageIndex} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Button
                    key={pageIndex}
                    variant={pageIndex === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium min-w-[36px]",
                      pageIndex === currentPage &&
                        "bg-pink-500 hover:bg-pink-600 text-white"
                    )}
                  >
                    {pageIndex + 1}
                  </Button>
                );
              }
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm font-medium"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
