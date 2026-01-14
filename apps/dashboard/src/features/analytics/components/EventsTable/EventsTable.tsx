import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Badge, EmptyState } from '@/components/ui';
import { AnalyticsFilters } from '../AnalyticsFilters/AnalyticsFilters';
import { useGetEvents } from '../../api/get-events';
import type { AnalyticsFilters as AnalyticsFiltersType } from '../../types';
import type { Database } from '@/types/database.types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

interface EventsTableProps {
  onEventClick?: (eventId: string) => void;
}

export function EventsTable({ onEventClick }: EventsTableProps) {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({});
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const pageSize = 10;

  const { data, isLoading, error } = useGetEvents({ filters, page, pageSize });

  const toggleRowExpansion = (eventId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const columns: ColumnDef<AnalyticsEvent>[] = [
    {
      id: 'expander',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => toggleRowExpansion(row.original.id)}
          className="text-gray-500 hover:text-gray-700"
        >
          {expandedRows.has(row.original.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      accessorKey: 'event_type',
      header: 'Event Type',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.event_type}
        </span>
      ),
    },
    {
      accessorKey: 'event_category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.event_category || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'workflow_name',
      header: 'Workflow',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.workflow_name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'success',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.success ? 'success' : 'error'} size="sm">
          {row.original.success ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
    {
      accessorKey: 'duration_ms',
      header: 'Duration',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.duration_ms !== null ? `${row.original.duration_ms}ms` : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading events: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} mode="events" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading events...</div>
        </div>
      ) : (!data?.data || data.data.length === 0) ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters to see more results."
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    {/* Expander */}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workflow Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((event) => (
                  <>
                    <tr
                      key={event.id}
                      className={`${event.success ? 'hover:bg-gray-50' : 'bg-red-50'}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap w-10">
                        <button
                          onClick={() => toggleRowExpansion(event.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedRows.has(event.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {event.event_category || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {event.workflow_name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={event.success ? 'success' : 'error'} size="sm">
                          {event.success ? 'Success' : 'Failed'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {event.duration_ms !== null ? `${event.duration_ms}ms` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                    {expandedRows.has(event.id) && (
                      <tr key={`${event.id}-expanded`}>
                        <td colSpan={7} className="px-4 py-4 bg-gray-50">
                          <div className="ml-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Event Data:</h4>
                            <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                              {JSON.stringify(event.event_data, null, 2)}
                            </pre>
                            {event.error_message && (
                              <>
                                <h4 className="text-sm font-semibold text-red-900 mt-4 mb-2">Error Message:</h4>
                                <p className="text-sm text-red-800 bg-red-50 p-3 rounded border border-red-200">{event.error_message}</p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
