import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { DataTable } from '@/components/DataTable';
import { DistributionFilters } from '../DistributionFilters/DistributionFilters';
import { ChannelChart } from '../ChannelChart/ChannelChart';
import { PerformanceChart } from '../PerformanceChart/PerformanceChart';
import { useGetDistributions } from '../../api/get-distributions';
import type { DistributionFilters as Filters } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import type { Database } from '@/types/database.types';

type Distribution = Database['public']['Tables']['distributions']['Row'];


export const DistributionsView: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: distributionsData, isLoading: isLoadingDistributions, error: distributionsError } = useGetDistributions({
    filters,
    page,
    pageSize,
  });

  // Get ALL distributions for charts (not paginated)
  const { data: allDistributionsData, isLoading: isLoadingAllDistributions } = useGetDistributions({
    filters,
    page: 1,
    pageSize: 1000, // Get all for chart calculations
  });

  const columns: ColumnDef<Distribution>[] = [
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ getValue }) => (
        <span className="capitalize font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ getValue }) => (getValue() as string | null) || '-',
    },
    {
      accessorKey: 'sent_at',
      header: 'Sent At',
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return value ? new Date(value).toLocaleString() : '-';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className={`
            inline-flex px-2 py-1 text-xs font-semibold rounded-full
            ${value === 'delivered' ? 'bg-green-100 text-green-800' : ''}
            ${value === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
            ${value === 'failed' ? 'bg-red-100 text-red-800' : ''}
            ${value === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
          `}>
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'opened_at',
      header: 'Opened',
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        return (
          <span className={value ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      },
    },
    {
      accessorKey: 'response_received',
      header: 'Response',
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        return (
          <span className={value ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      },
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (distributionsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading distributions: {distributionsError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <DistributionFilters filters={filters} onFiltersChange={setFilters} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sends by Channel</h2>
          {isLoadingAllDistributions ? (
            <div className="animate-pulse h-[300px] bg-gray-200 rounded" />
          ) : (
            <ChannelChart distributions={allDistributionsData?.data || []} />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Rate Over Time</h2>
          {isLoadingAllDistributions ? (
            <div className="animate-pulse h-[300px] bg-gray-200 rounded" />
          ) : (
            <PerformanceChart distributions={allDistributionsData?.data || []} />
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Distributions</h2>
        <DataTable
          columns={columns}
          data={distributionsData?.data || []}
          isLoading={isLoadingDistributions}
          pagination={{
            currentPage: page,
            pageSize,
            totalItems: distributionsData?.total || 0,
            onPageChange: handlePageChange,
          }}
        />
      </Card>
    </div>
  );
};

DistributionsView.displayName = 'DistributionsView';
