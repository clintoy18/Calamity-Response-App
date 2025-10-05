import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, unknown>[]
}

export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Modern table */}
      <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/60 bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-gray-50/80 transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sleek pagination controls */}
      <div className="flex items-center justify-between pt-2">
        {/* Modern page indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const currentPage = table.getState().pagination.pageIndex;
            let pageIndex = i;
            
            if (table.getPageCount() > 5) {
              if (currentPage > 2) {
                pageIndex = currentPage - 2 + i;
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

        {/* Navigation buttons */}
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
  )
}