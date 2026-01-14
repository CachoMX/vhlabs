import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PromptWithHistory } from '../types';
import type { Database } from '@/types/database.types';

type Prompt = Database['public']['Tables']['prompts']['Row'];

async function getPrompt(id: string): Promise<PromptWithHistory> {
  // Get the specific prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (promptError) {
    throw new Error(`Failed to fetch prompt: ${promptError.message}`);
  }

  if (!prompt) {
    throw new Error('Prompt not found');
  }

  // Get all versions of this prompt (same prompt_id)
  const { data: versions, error: versionsError } = await supabase
    .from('prompts')
    .select('*')
    .eq('prompt_id', prompt.prompt_id)
    .order('version', { ascending: false });

  if (versionsError) {
    throw new Error(`Failed to fetch prompt versions: ${versionsError.message}`);
  }

  return {
    prompt,
    versions: versions || [],
  };
}

export function useGetPrompt(id: string) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: () => getPrompt(id),
    enabled: !!id,
  });
}
