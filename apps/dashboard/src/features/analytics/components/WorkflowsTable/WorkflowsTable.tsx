import { useState } from 'react';
import { Badge, EmptyState } from '@/components/ui';
import { DataTable } from '@/components/DataTable';
import { AnalyticsFilters } from '../AnalyticsFilters/AnalyticsFilters';
import { useGetWorkflows } from '../../api/get-workflows';
import type { AnalyticsFilters as AnalyticsFiltersType } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import type { Database } from '@/types/database.types';

type WorkflowLog = Database['public']['Tables']['workflow_logs']['Row'];

interface WorkflowsTableProps {
  onWorkflowClick?: (workflowId: string) => void;
}

export function WorkflowsTable({ onWorkflowClick: _onWorkflowClick }: WorkflowsTableProps) {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading, error } = useGetWorkflows({ filters, page, pageSize });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
        <div>
          <div className="font-medium text-gray-900">
            {row.original.workflow_name || 'Unknown'}
          </div>
          {row.original.execution_id && (
            <div className="text-xs text-gray-500 mt-1 font-mono">
              ID: {row.original.execution_id.substring(0, 12)}...
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
      header: 'Started',
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
      header: 'Completed',
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
      id: 'error',
      header: 'Error',
      cell: ({ row }) => (
        <div>
          {row.original.error_data && (
            <div className="max-w-xs">
              <span className="text-sm text-red-600 truncate block" title={typeof row.original.error_data === 'string' ? row.original.error_data : JSON.stringify(row.original.error_data)}>
                {typeof row.original.error_data === 'string'
                  ? row.original.error_data
                  : JSON.stringify(row.original.error_data)}
              </span>
            </div>
          )}
        </div>
      ),
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
    <div className="space-y-4">
      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} mode="workflows" />

      <div className="bg-gray-100 rounded-lg p-4 grid grid-cols-3 gap-4">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Total Workflows:</span> {data?.total?.toLocaleString() || 0}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Success Rate:</span>{' '}
          {data?.data
            ? `${Math.round((data.data.filter(w => w.status === 'completed').length / data.data.length) * 100)}%`
            : '0%'}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-semibold">Failed:</span>{' '}
          {data?.data?.filter(w => w.status === 'failed').length || 0}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading workflows...</div>
        </div>
      ) : (!data?.data || data.data.length === 0) ? (
        <EmptyState
          title="No workflows found"
          description="Try adjusting your filters to see more results."
        />
      ) : (
        <DataTable
          data={data.data}
          columns={columns}
          pageSize={pageSize}
          pagination={{
            currentPage: page,
            pageSize,
            totalItems: data.total,
            onPageChange: handlePageChange,
          }}
          emptyState={
            <EmptyState
              title="No workflows found"
              description="Try adjusting your filters."
            />
          }
        />
      )}
    </div>
  );
}
