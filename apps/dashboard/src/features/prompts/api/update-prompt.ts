import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

export interface UpdatePromptParams {
  promptId: string;
  data: {
    name: string;
    description?: string | null;
    category?: string | null;
    content: string;
    variables?: string[] | null;
    system: string;
  };
}

async function updatePrompt({ promptId, data }: UpdatePromptParams): Promise<void> {
  // First, get the current highest version for this prompt_id
  const { data: existingVersions, error: fetchError } = await supabase
    .from('prompts')
    .select('version')
    .eq('prompt_id', promptId)
    .order('version', { ascending: false })
    .limit(1);

  if (fetchError) {
    throw new Error(`Failed to fetch existing versions: ${fetchError.message}`);
  }

  const nextVersion = existingVersions && existingVersions.length > 0
    ? (existingVersions[0] as any).version + 1
    : 1;

  // Deactivate all existing versions
  const { error: deactivateError } = await supabase
    .from('prompts')
  // @ts-ignore
    .update({ is_active: false } as any)
    .eq('prompt_id', promptId);

  if (deactivateError) {
    throw new Error(`Failed to deactivate existing versions: ${deactivateError.message}`);
  }

  // Create new version
  const newPrompt: PromptInsert = {
    prompt_id: promptId,
    version: nextVersion,
    name: data.name,
    description: data.description,
    category: data.category,
    content: data.content,
    variables: data.variables,
    system: data.system,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from('prompts')
    .insert(newPrompt as any);

  if (insertError) {
    throw new Error(`Failed to create new prompt version: ${insertError.message}`);
  }
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrompt,
    onSuccess: (_, _variables) => {
      // Invalidate and refetch prompt queries
      queryClient.invalidateQueries({ queryKey: ['prompt'] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
