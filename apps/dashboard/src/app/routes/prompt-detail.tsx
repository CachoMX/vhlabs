import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '@/components';
import { PromptDetail } from '@/features/prompts';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export function PromptDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/prompts');
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Prompt Details"
        description="Edit prompt content, manage versions, and test output"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/prompts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prompts
          </Button>
        }
      />
      <PromptDetail promptId={id} />
    </PageContainer>
  );
}
