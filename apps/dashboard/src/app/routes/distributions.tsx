import { PageContainer, PageHeader } from '@/components';
import { DistributionsView } from '@/features/distributions';

export function DistributionsRoute() {
  return (
    <PageContainer>
      <PageHeader
        title="Distributions"
        description="Track distribution performance across email, SMS, and social channels"
      />
      <DistributionsView />
    </PageContainer>
  );
}
