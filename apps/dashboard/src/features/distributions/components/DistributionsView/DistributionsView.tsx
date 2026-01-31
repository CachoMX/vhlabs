import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui';
import { DataTable } from '@/components/DataTable';
import { DistributionFilters } from '../DistributionFilters/DistributionFilters';
import { ChannelChart } from '../ChannelChart/ChannelChart';
import { PerformanceChart } from '../PerformanceChart/PerformanceChart';
import { useGetDistributions, type DistributionWithContact } from '../../api/get-distributions';
import type { DistributionFilters as Filters } from '../../types';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';


export const DistributionsView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<Filters>(() => {
    const channel = searchParams.get('channel') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const search = searchParams.get('search') || undefined;

    return {
      channel,
      dateFrom,
      dateTo,
      search,
    };
  });

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const pageSize = 10;

  // Sync URL params with filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.channel) params.set('channel', filters.channel);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.search) params.set('search', filters.search);
    if (page !== 1) params.set('page', page.toString());

    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);
  const [previewDistribution, setPreviewDistribution] = useState<DistributionWithContact | null>(null);

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

  const columns: ColumnDef<DistributionWithContact>[] = [
    {
      accessorKey: 'channel',
      header: 'Channel',
      cell: ({ getValue }) => (
        <span className="capitalize font-medium">{getValue() as string}</span>
      ),
    },
    {
      id: 'recipient',
      header: 'Recipient',
      cell: ({ row }) => {
        const contact = row.original.contact;
        const channel = row.original.channel;

        if (!contact) return <span className="text-gray-400">-</span>;

        const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown';
        const contactInfo = channel === 'sms' ? contact.phone : contact.email;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{name}</span>
            {contactInfo && <span className="text-xs text-gray-500">{contactInfo}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ getValue }) => {
        const value = (getValue() as string | null) || '-';
        return (
          <div className="max-w-[150px] truncate" title={value}>
            {value}
          </div>
        );
      },
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
    {
      id: 'preview',
      header: 'Preview',
      cell: ({ row }) => (
        <button
          onClick={() => setPreviewDistribution(row.original)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Preview message"
        >
          <Eye className="h-4 w-4 text-gray-600" />
        </button>
      ),
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

      {/* Preview Modal */}
      {previewDistribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewDistribution.channel === 'voice' ? 'Voice Call Details' : 'Message Preview'}
              </h3>
              <button
                onClick={() => setPreviewDistribution(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Voice Call Preview */}
              {previewDistribution.channel === 'voice' && (
                <>
                  {/* Recipient Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient</h4>
                    {previewDistribution.contact ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {[previewDistribution.contact.first_name, previewDistribution.contact.last_name]
                            .filter(Boolean)
                            .join(' ') || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">{previewDistribution.contact.phone}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No contact information</p>
                    )}
                  </div>

                  {/* Call Outcome & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Call Outcome</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        (previewDistribution as any).call_outcome === 'completed' ? 'bg-green-100 text-green-800' :
                        (previewDistribution as any).call_outcome === 'no_answer' ? 'bg-red-100 text-red-800' :
                        (previewDistribution as any).call_outcome === 'voicemail' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(previewDistribution as any).call_outcome || 'unknown'}
                      </span>
                    </div>
                    {(previewDistribution as any).duration_seconds !== null && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                        <p className="text-sm text-gray-900">
                          {Math.floor((previewDistribution as any).duration_seconds / 60)}:{String((previewDistribution as any).duration_seconds % 60).padStart(2, '0')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Interest Level */}
                  {(previewDistribution as any).interest_level && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Interest Level</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {(previewDistribution as any).interest_level}
                      </span>
                    </div>
                  )}

                  {/* AI Summary */}
                  {(previewDistribution as any).call_notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">AI Summary</h4>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap">
                        {(previewDistribution as any).call_notes}
                      </div>
                    </div>
                  )}

                  {/* Recording Player */}
                  {(previewDistribution as any).recording_url && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Call Recording</h4>
                      <audio controls className="w-full">
                        <source src={(previewDistribution as any).recording_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Full Transcript */}
                  {(previewDistribution as any).transcript && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Full Transcript</h4>
                      <details className="bg-gray-50 rounded-lg p-4">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                          View Full Transcript
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                          {(previewDistribution as any).transcript}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 space-y-1">
                    {previewDistribution.sent_at && (
                      <p>Call Date: {new Date(previewDistribution.sent_at).toLocaleString()}</p>
                    )}
                  </div>
                </>
              )}

              {/* Regular Email/SMS Preview */}
              {previewDistribution.channel !== 'voice' && (
                <>
              {/* Recipient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient</h4>
                {previewDistribution.contact ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {[previewDistribution.contact.first_name, previewDistribution.contact.last_name]
                        .filter(Boolean)
                        .join(' ') || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {previewDistribution.channel === 'sms'
                        ? previewDistribution.contact.phone
                        : previewDistribution.contact.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No contact information</p>
                )}
              </div>

              {/* Channel & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Channel</h4>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {previewDistribution.channel}
                  </span>
                </div>
                {previewDistribution.message_type && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Type</h4>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
                      {previewDistribution.message_type}
                    </span>
                  </div>
                )}
              </div>

              {/* Subject (for emails) */}
              {previewDistribution.subject && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Subject</h4>
                  <p className="text-sm text-gray-900">{previewDistribution.subject}</p>
                </div>
              )}

              {/* Message Content */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Message</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-900 whitespace-pre-wrap">
                  {previewDistribution.message_content || 'No message content'}
                </div>
              </div>

              {/* Media URL */}
              {previewDistribution.media_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Media</h4>
                  <a
                    href={previewDistribution.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    {previewDistribution.media_url}
                  </a>
                </div>
              )}

              {/* Response (if any) */}
              {previewDistribution.response_received && previewDistribution.response_text && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Response Received</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{previewDistribution.response_text}</p>
                  {previewDistribution.response_sentiment && (
                    <span className="inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                      {previewDistribution.response_sentiment}
                    </span>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 space-y-1">
                {previewDistribution.sent_at && (
                  <p>Sent: {new Date(previewDistribution.sent_at).toLocaleString()}</p>
                )}
                {previewDistribution.opened_at && (
                  <p>Opened: {new Date(previewDistribution.opened_at).toLocaleString()}</p>
                )}
                {previewDistribution.response_at && (
                  <p>Responded: {new Date(previewDistribution.response_at).toLocaleString()}</p>
                )}
              </div>
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DistributionsView.displayName = 'DistributionsView';
