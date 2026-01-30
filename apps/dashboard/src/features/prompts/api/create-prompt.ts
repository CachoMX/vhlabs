import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

export async function createPrompt(data: PromptInsert) {
  const { data: prompt, error } = await (supabase as any)
    .from('prompts')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create prompt: ${error.message}`);
  }

  if (!prompt) {
    throw new Error('No prompt returned after creation');
  }

  return prompt;
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
