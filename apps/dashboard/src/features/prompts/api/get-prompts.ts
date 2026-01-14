import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { PromptFilters } from '../types';

type Prompt = Database['public']['Tables']['prompts']['Row'];

export interface GetPromptsParams {
  filters?: PromptFilters;
  page?: number;
  pageSize?: number;
}

export interface GetPromptsResponse {
  data: Prompt[];
  total: number;
  page: number;
  pageSize: number;
}

async function getPrompts(params: GetPromptsParams = {}): Promise<GetPromptsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.system) {
    query = query.eq('system', filters.system);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by updated_at descending
  query = query.order('updated_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch prompts: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetPrompts(params: GetPromptsParams = {}) {
  return useQuery({
    queryKey: ['prompts', params],
    queryFn: () => getPrompts(params),
  });
}
