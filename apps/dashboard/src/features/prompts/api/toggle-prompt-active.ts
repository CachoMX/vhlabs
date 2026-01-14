import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface TogglePromptActiveParams {
  id: string;
  isActive: boolean;
}

async function togglePromptActive({ id, isActive }: TogglePromptActiveParams): Promise<void> {
  const { error } = await supabase
    .from('prompts')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to toggle prompt active status: ${error.message}`);
  }
}

export function useTogglePromptActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePromptActive,
    onSuccess: (_, variables) => {
      // Invalidate and refetch prompt queries
      queryClient.invalidateQueries({ queryKey: ['prompt', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
