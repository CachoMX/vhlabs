import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '@/components';
import { ContentDetail } from '@/features/content';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export function ContentDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/content');
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Content Details"
        description="View and edit content details, hooks, and distribution history"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/content')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Button>
        }
      />
      <ContentDetail contentId={id} />
    </PageContainer>
  );
}
