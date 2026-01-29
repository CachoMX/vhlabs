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
    onSuccess: (_, variables) => {
      // Invalidate and refetch content queries
      queryClient.invalidateQueries({ queryKey: ['content', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
