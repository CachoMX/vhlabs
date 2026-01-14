import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { ContentFilters } from '../types';

type Content = Database['public']['Tables']['contents']['Row'];

export interface GetContentsParams {
  filters?: ContentFilters;
  page?: number;
  pageSize?: number;
}

export interface GetContentsResponse {
  data: Content[];
  total: number;
  page: number;
  pageSize: number;
}

async function getContents(params: GetContentsParams = {}): Promise<GetContentsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('contents')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters.audience) {
    query = query.contains('audiences', [filters.audience]);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by created_at descending
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch contents: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetContents(params: GetContentsParams = {}) {
  return useQuery({
    queryKey: ['contents', params],
    queryFn: () => getContents(params),
  });
}
