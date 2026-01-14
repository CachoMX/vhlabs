import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '@/components';
import { PromptsList } from '@/features/prompts';

export function PromptsRoute() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="AI Prompt Library"
        description="Manage AI prompts across all systems with versioning and testing"
      />
      <PromptsList onEdit={(id) => navigate(`/prompts/${id}`)} />
    </PageContainer>
  );
}
