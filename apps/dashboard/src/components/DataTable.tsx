import { ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[] | any[];
  pageSize?: number;
  emptyState?: ReactNode;
  isLoading?: boolean;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ data, columns, pageSize = 10, emptyState, isLoading: _isLoading, pagination }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // If external pagination is provided, don't use client-side pagination
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Only use client-side pagination if no external pagination is provided
    ...(pagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: {
      pagination: {
        pageSize: pagination?.pageSize || pageSize,
      },
    },
  });

  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  // Use external pagination if provided, otherwise use TanStack Table's pagination
  const showPagination = pagination ? pagination.totalItems > pagination.pageSize : table.getPageCount() > 1;
  const currentPage = pagination?.currentPage || table.getState().pagination.pageIndex + 1;
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : table.getPageCount();
  const from = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : table.getState().pagination.pageIndex * pageSize + 1;
  const to = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) : Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length);
  const total = pagination?.totalItems || data.length;

  const handlePrevious = () => {
    if (pagination) {
      pagination.onPageChange(pagination.currentPage - 1);
    } else {
      table.previousPage();
    }
  };

  const handleNext = () => {
    if (pagination) {
      pagination.onPageChange(pagination.currentPage + 1);
    } else {
      table.nextPage();
    }
  };

  const canGoPrevious = pagination ? pagination.currentPage > 1 : table.getCanPreviousPage();
  const canGoNext = pagination ? pagination.currentPage < totalPages : table.getCanNextPage();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center gap-2 cursor-pointer select-none'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {from.toLocaleString()} to {to.toLocaleString()} of {total.toLocaleString()} results
            {pagination && <span className="ml-2">(Page {currentPage} of {totalPages})</span>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
