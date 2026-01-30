import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

async function archiveContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('contents')
  // @ts-ignore
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to archive content: ${error.message}`);
  }
}

export function useArchiveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveContent,
    onMutate: async (contentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['contents'] });

      // Snapshot previous value
      const previousContents = queryClient.getQueryData(['contents']);

      // Optimistically update to show archived status immediately
      queryClient.setQueriesData({ queryKey: ['contents'] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((content: any) =>
            content.id === contentId
              ? { ...content, status: 'archived', updated_at: new Date().toISOString() }
              : content
          ),
        };
      });

      return { previousContents };
    },
    onError: (_err, _contentId, context) => {
      // Rollback on error
      if (context?.previousContents) {
        queryClient.setQueryData(['contents'], context.previousContents);
      }
    },
    onSuccess: (_, contentId) => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['content', contentId] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
