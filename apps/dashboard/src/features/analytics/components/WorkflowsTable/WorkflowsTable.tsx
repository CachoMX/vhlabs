import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import { Badge, EmptyState } from '@/components/ui';
import { AnalyticsFilters } from '../AnalyticsFilters/AnalyticsFilters';
import { useGetWorkflows } from '../../api/get-workflows';
import type { AnalyticsFilters as AnalyticsFiltersType } from '../../types';
import type { Database } from '@/types/database.types';

type WorkflowLog = Database['public']['Tables']['workflow_logs']['Row'];

interface WorkflowsTableProps {
  onWorkflowClick?: (workflowId: string) => void;
}

export function WorkflowsTable({ onWorkflowClick }: WorkflowsTableProps) {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useGetWorkflows({ filters, page, pageSize });

  const getStatusVariant = (status: string | null): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    if (!status) return 'default';

    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns: ColumnDef<WorkflowLog>[] = [
    {
      accessorKey: 'workflow_name',
      header: 'Workflow Name',
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">
            {row.original.workflow_name || 'Unknown'}
          </div>
          {row.original.execution_id && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              {row.original.execution_id.substring(0, 8)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)} size="sm">
          {row.original.status || 'Unknown'}
        </Badge>
      ),
    },
    {
      accessorKey: 'started_at',
      header: 'Started At',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.started_at
            ? new Date(row.original.started_at).toLocaleString()
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'completed_at',
      header: 'Completed At',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.completed_at
            ? new Date(row.original.completed_at).toLocaleString()
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'duration_ms',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.duration_ms !== null
            ? `${(row.original.duration_ms / 1000).toFixed(2)}s`
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'nodes_executed',
      header: 'Nodes',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.nodes_executed || '0'}
        </span>
      ),
    },
    {
      accessorKey: 'error_data',
      header: 'Error',
      cell: ({ row }) => {
        if (!row.original.error_data) {
          return <span className="text-sm text-gray-400">-</span>;
        }

        const errorData = typeof row.original.error_data === 'string'
          ? row.original.error_data
          : JSON.stringify(row.original.error_data);

        return (
          <div className="max-w-xs">
            <span className="text-sm text-red-600 truncate block" title={errorData}>
              {errorData}
            </span>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading workflows: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} mode="workflows" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading workflows...</div>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((workflow) => {
            const hasError = workflow.status?.toLowerCase() === 'failed' || workflow.error_data;

            return (
              <div
                key={workflow.id}
                className={`overflow-hidden rounded-lg border ${
                  hasError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <tbody>
                      <tr className={!hasError ? 'hover:bg-gray-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="max-w-md">
                            <div className="font-medium text-gray-900">
                              {workflow.workflow_name || 'Unknown'}
                            </div>
                            {workflow.execution_id && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                {workflow.execution_id.substring(0, 8)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={getStatusVariant(workflow.status)} size="sm">
                            {workflow.status || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {workflow.started_at
                              ? new Date(workflow.started_at).toLocaleString()
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {workflow.completed_at
                              ? new Date(workflow.completed_at).toLocaleString()
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {workflow.duration_ms !== null
                              ? `${(workflow.duration_ms / 1000).toFixed(2)}s`
                              : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-700">
                            {workflow.nodes_executed || '0'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {workflow.error_data && (
                            <div className="max-w-xs">
                              <span className="text-sm text-red-600 truncate block">
                                {typeof workflow.error_data === 'string'
                                  ? workflow.error_data
                                  : JSON.stringify(workflow.error_data)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {(!data?.data || data.data.length === 0) && (
            <EmptyState
              title="No workflows found"
              description="Try adjusting your filters to see more results."
            />
          )}
        </div>
      )}
    </div>
  );
}
