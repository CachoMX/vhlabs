import { PageContainer, PageHeader } from '@/components';
import { ContentList } from '@/features/content';
import { useNavigate } from 'react-router-dom';

export function ContentRoute() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Content Pipeline"
        description="Manage and monitor content processing and distribution"
      />
      <ContentList onViewDetails={(id) => navigate(`/content/${id}`)} />
    </PageContainer>
  );
}
