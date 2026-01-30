import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '@/components';
import { Card, Spinner, Button } from '@/components/ui';
import { ContactsList, useGetContacts, exportContacts, ContactFilters as ContactFiltersComponent, type ContactFiltersType } from '@/features/contacts';
import { downloadCSV } from '@/utils/export';

export function ContactsRoute() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const [pageSize, setPageSize] = useState(() => {
    const pageSizeParam = searchParams.get('pageSize');
    return pageSizeParam ? parseInt(pageSizeParam, 10) : 100;
  });

  const [filters, setFilters] = useState<ContactFiltersType>(() => {
    const search = searchParams.get('search') || undefined;
    const segment = searchParams.get('segment') || undefined;
    const investor_status = searchParams.get('investor_status') || undefined;
    const scoreMin = searchParams.get('scoreMin');
    const scoreMax = searchParams.get('scoreMax');
    const excludeScoreMin = searchParams.get('excludeScoreMin');
    const excludeScoreMax = searchParams.get('excludeScoreMax');
    const excludeSegments = searchParams.get('excludeSegments')?.split(',').filter(Boolean);
    const excludeStatuses = searchParams.get('excludeStatuses')?.split(',').filter(Boolean);

    return {
      search,
      segment,
      investor_status,
      scoreMin: scoreMin ? parseInt(scoreMin, 10) : undefined,
      scoreMax: scoreMax ? parseInt(scoreMax, 10) : undefined,
      excludeScoreMin: excludeScoreMin ? parseInt(excludeScoreMin, 10) : undefined,
      excludeScoreMax: excludeScoreMax ? parseInt(excludeScoreMax, 10) : undefined,
      excludeSegments: excludeSegments && excludeSegments.length > 0 ? excludeSegments : undefined,
      excludeStatuses: excludeStatuses && excludeStatuses.length > 0 ? excludeStatuses : undefined,
    };
  });

  const { data, isLoading, error } = useGetContacts({ page, pageSize, filters });

  // Sync URL params with state
  useEffect(() => {
    const params = new URLSearchParams();

    // Add pagination params
    if (page !== 1) params.set('page', page.toString());
    if (pageSize !== 100) params.set('pageSize', pageSize.toString());

    // Add filter params
    if (filters.search) params.set('search', filters.search);
    if (filters.segment) params.set('segment', filters.segment);
    if (filters.investor_status) params.set('investor_status', filters.investor_status);
    if (filters.scoreMin !== undefined) params.set('scoreMin', filters.scoreMin.toString());
    if (filters.scoreMax !== undefined) params.set('scoreMax', filters.scoreMax.toString());
    if (filters.excludeScoreMin !== undefined) params.set('excludeScoreMin', filters.excludeScoreMin.toString());
    if (filters.excludeScoreMax !== undefined) params.set('excludeScoreMax', filters.excludeScoreMax.toString());
    if (filters.excludeSegments && filters.excludeSegments.length > 0) {
      params.set('excludeSegments', filters.excludeSegments.join(','));
    }
    if (filters.excludeStatuses && filters.excludeStatuses.length > 0) {
      params.set('excludeStatuses', filters.excludeStatuses.join(','));
    }

    setSearchParams(params, { replace: true });
  }, [page, pageSize, filters, setSearchParams]);

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Contacts"
          description="View contact segments, engagement metrics, and touchpoint history"
        />
        <Card className="p-6">
          <div className="text-center text-red-600">
            Error loading contacts: {error.message}
          </div>
        </Card>
      </PageContainer>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleFiltersChange = (newFilters: ContactFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting all contacts...', { id: 'export' });

      // Fetch ALL contacts with current filters (no pagination)
      const allContacts = await exportContacts(filters);

      const exportData = allContacts.map(contact => ({
        'Name': `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
        'Email': contact.email || '',
        'Phone': contact.phone || '',
        'Segment': contact.segment_name || '',
        'Status': contact.status_name || '',
        'Score': contact.score || 0,
        'Last Touchpoint': contact.last_touchpoint_at || '',
        'Total Touchpoints': contact.touchpoint_count || 0,
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(exportData, `contacts-${timestamp}`);

      toast.success(`Exported ${exportData.length.toLocaleString()} contacts`, { id: 'export' });
    } catch (error) {
      toast.error('Failed to export contacts', { id: 'export' });
      console.error('Export error:', error);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        description="View contact segments, engagement metrics, and touchpoint history"
      />
      <div className="mb-6">
        <ContactFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="p-6">
          {data && (
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Total Contacts: <span className="font-semibold">{data.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
              </div>
            </div>
          )}
          <ContactsList
            data={data?.data || []}
            pagination={{
              currentPage: page,
              pageSize,
              totalItems: data?.total || 0,
              onPageChange: handlePageChange,
            }}
          />
        </Card>
      )}
    </PageContainer>
  );
}
