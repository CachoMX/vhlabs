import { useState } from 'react';
import { PageContainer, PageHeader } from '@/components';
import { Card, Spinner } from '@/components/ui';
import { ContactsList, useGetContacts, ContactFilters as ContactFiltersComponent, type ContactFiltersType } from '@/features/contacts';

export function ContactsRoute() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<ContactFiltersType>({});
  const { data, isLoading, error } = useGetContacts({ page, pageSize, filters });

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
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total Contacts: <span className="font-semibold">{data.total.toLocaleString()}</span>
              </div>
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
