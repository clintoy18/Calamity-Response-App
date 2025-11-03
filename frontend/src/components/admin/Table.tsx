import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowData,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"; 
import { Search, Filter, Database } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  filterKeys?: (keyof TData | string)[];
  filterOptions?: Record<string, FilterOption[]>;
  title?: string;
  description?: string;
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  filterKeys = [],
  filterOptions = {},
  title,
  description,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const getFilterCount = (key: string, filterValue: string) => {
    if (filterValue === "all") return data.length;
    return data.filter((item) => {
      const value = item[key as keyof TData];
      if (key === "isVerified") return filterValue === "verified" ? value === true : value === false;
      if (typeof value === "string") return value.toLowerCase() === filterValue.toLowerCase();
      return false;
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      {(title || description) && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white">
          <CardHeader className="pb-3">
            {title && (
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-5 h-5 text-blue-500" />
                {title}
              </CardTitle>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Search and Filter Card */}
      <Card className="bg-background/50 backdrop-blur-sm border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9 pr-4 h-11 bg-background border-input/50 focus:border-blue-300 transition-colors"
              />
            </div>

            {/* Single Filter Dropdown */}
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />

              <Select
                value={activeFilters["global"] || "all"}
                onValueChange={(value) => {
                  setActiveFilters({ global: value });
                  const colFilters: ColumnFiltersState = [];

                  if (value && value !== "all") {
                    filterKeys.forEach((key) => {
                    const match = filterOptions[String(key)]?.find((opt: FilterOption) => opt.value === value);
                      if (match) {
                        if (key === "isVerified") 
                          colFilters.push({ id: String(key), value: value === "verified" });
                        else 
                          colFilters.push({ id: String(key), value });
                      }
                    });
                  }

                  setColumnFilters(colFilters);
                }}
              >
                <SelectTrigger className="h-10 w-60">
                  <SelectValue placeholder="Filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({data.length})</SelectItem>
                  {filterKeys.map((key) =>
                    filterOptions[String(key)]?.map((option: FilterOption) => (
                      <SelectItem key={`${String(key)}-${option.value}`} value={option.value}>
                        {String(key)}: {option.label} ({getFilterCount(String(key), option.value)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg border">
              <span className="text-sm font-medium text-muted-foreground">
                Results
              </span>
              <Badge variant="secondary" className="px-2 py-1 font-semibold">
                {table.getFilteredRowModel().rows.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-foreground/80 py-4 border-b"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center gap-2 cursor-pointer select-none group transition-colors"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? "↕"}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
  {table.getFilteredRowModel().rows.length === 0 ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <p className="font-medium text-foreground/80">
            {activeFilters["global"] && activeFilters["global"] !== "all"
              ? "No results match your filter"
              : "No data available"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  ) : (
    table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="group hover:bg-muted/30 transition-colors border-b last:border-b-0"
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell
            key={cell.id}
            className="py-3 group-hover:text-foreground/90 transition-colors"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  )}
</TableBody>

          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>{table.getFilteredRowModel().rows.length} total items</span>
        </div>

        <Pagination>
          <PaginationContent className="flex items-center gap-2">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-muted transition-colors"
                }
                size="sm"
              />
            </PaginationItem>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
                const pageIndex =
                  table.getPageCount() > 5
                    ? Math.max(
                        0,
                        Math.min(table.getState().pagination.pageIndex - 2 + i, table.getPageCount() - 5)
                      )
                    : i;

                return (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink
                      onClick={() => table.setPageIndex(pageIndex)}
                      isActive={table.getState().pagination.pageIndex === pageIndex}
                      className="cursor-pointer min-w-9"
                    >
                      {pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
            </div>

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                className={
                  !table.getCanNextPage()
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer hover:bg-muted transition-colors"
                }
                size="sm"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
