import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

async function archiveContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('contents')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to archive content: ${error.message}`);
  }
}

export function useArchiveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveContent,
    onSuccess: (_, contentId) => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['content', contentId] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
