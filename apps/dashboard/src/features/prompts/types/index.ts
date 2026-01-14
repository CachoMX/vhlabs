import type { Database } from '@/types/database.types';

type Prompt = Database['public']['Tables']['prompts']['Row'];

export interface PromptFilters {
  system?: string;
  category?: string;
}

export interface PromptWithHistory {
  prompt: Prompt;
  versions: Prompt[];
}
