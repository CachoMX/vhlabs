import { PageContainer, PageHeader } from '@/components';
import { DashboardView } from '@/features/dashboard';

export function DashboardRoute() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Monitor content processing, distribution metrics, and system health"
      />
      <DashboardView />
    </PageContainer>
  );
}
