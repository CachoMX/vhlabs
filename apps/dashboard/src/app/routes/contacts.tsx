import { useState } from 'react';
import { PageContainer, PageHeader } from '@/components';
import { Card, Spinner } from '@/components/ui';
import { ContactsList, useGetContacts } from '@/features/contacts';

export function ContactsRoute() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useGetContacts({ page, pageSize: 25 });

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

  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        description="View contact segments, engagement metrics, and touchpoint history"
      />
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="p-6">
          <ContactsList data={data?.data || []} />
        </Card>
      )}
    </PageContainer>
  );
}
