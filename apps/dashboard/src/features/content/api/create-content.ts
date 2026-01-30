import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type ContentInsert = Database['public']['Tables']['contents']['Insert'];

export async function createContent(data: ContentInsert) {
  const { data: content, error } = await (supabase as any)
    .from('contents')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create content: ${error.message}`);
  }

  if (!content) {
    throw new Error('No content returned after creation');
  }

  return content;
}

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}
