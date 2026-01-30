import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type ContentUpdate = Database['public']['Tables']['contents']['Update'];

export interface UpdateContentParams {
  id: string;
  data: Omit<ContentUpdate, 'id' | 'created_at' | 'updated_at'>;
}

async function updateContent({ id, data }: UpdateContentParams): Promise<void> {
  const { error } = await supabase
    .from('contents')
  // @ts-ignore
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update content: ${error.message}`);
  }
}

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContent,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['content', variables.id] });

      // Snapshot previous value
      const previousContent = queryClient.getQueryData(['content', variables.id]);

      // Optimistically update content
      queryClient.setQueryData(['content', variables.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...variables.data,
          updated_at: new Date().toISOString(),
        };
      });

      return { previousContent };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousContent) {
        queryClient.setQueryData(['content', variables.id], context.previousContent);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['content', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
