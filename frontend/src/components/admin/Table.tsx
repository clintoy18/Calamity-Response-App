import React, { useState } from 'react';
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
} from '@tanstack/react-table';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[]; // changed unknown -> any for cell type
  searchPlaceholder?: string;
  filterKey?: keyof TData | string;
  filterOptions?: FilterOption[];
}

export function DataTable<TData extends RowData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  filterKey,
  filterOptions = [],
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

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

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    if (value === 'all') {
      setColumnFilters([]);
    } else if (filterKey) {
      if (filterKey === 'isVerified') {
        const boolValue = value === 'verified';
        setColumnFilters([{ id: filterKey as string, value: boolValue }]);
      } else {
        setColumnFilters([{ id: filterKey as string, value }]);
      }
    }
  };

  const getFilterCount = (filterValue: string) => {
    if (filterValue === 'all') return data.length;
    if (!filterKey) return 0;

    return data.filter((item) => {
      const value = item[filterKey as keyof TData];
      if (typeof value === 'boolean') {
        return filterValue === 'verified' ? value === true : value === false;
      }
      return value === filterValue;
    }).length;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filter Buttons */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((option) => {
              const count = getFilterCount(option.value);
              const isActive = activeFilter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Total Count */}
        <div className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
          <span className="font-medium">Showing:</span>
          <span className="px-2 py-1 bg-gray-100 rounded-md font-semibold">
            {table.getFilteredRowModel().rows.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-200/60 bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center gap-2 cursor-pointer select-none hover:text-gray-900 transition-colors'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted() as string] ?? '↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200/60">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No results found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-50/80 transition-colors duration-150">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm font-medium text-gray-900"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const currentPage = table.getState().pagination.pageIndex;
            let pageIndex = i;

            if (table.getPageCount() > 5) {
              if (currentPage > 2) {
                pageIndex = currentPage - 2 + i;
              }
              if (pageIndex >= table.getPageCount()) {
                pageIndex = table.getPageCount() - 5 + i;
              }
            }

            return (
              <button
                key={i}
                onClick={() => table.setPageIndex(pageIndex)}
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  currentPage === pageIndex
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8 shadow-sm shadow-blue-500/30'
                    : 'bg-gray-300/70 w-2 hover:bg-gray-400 hover:w-4 hover:shadow-sm'
                }`}
                aria-label={`Go to page ${pageIndex + 1}`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-lg hover:bg-white hover:border-gray-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100/80 backdrop-blur-sm rounded-lg min-w-[70px] text-center border border-gray-200/50">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center text-white bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-lg hover:shadow-gray-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
