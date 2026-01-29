import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { DistributionFilters } from '../types';

type Distribution = Database['public']['Tables']['distributions']['Row'];

export interface DistributionWithContact extends Distribution {
  contact?: {
    email: string | null;
    phone: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface GetDistributionsParams {
  filters?: DistributionFilters;
  page?: number;
  pageSize?: number;
}

export interface GetDistributionsResponse {
  data: DistributionWithContact[];
  total: number;
  page: number;
  pageSize: number;
}

async function getDistributions(params: GetDistributionsParams = {}): Promise<GetDistributionsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('distributions')
    .select(`
      *,
      contact:contacts_sync!contact_sync_id(
        email,
        phone,
        first_name,
        last_name
      )
    `, { count: 'exact' });

  // Apply filters
  if (filters.channel) {
    query = query.eq('channel', filters.channel);
  }

  if (filters.dateFrom) {
    query = query.gte('sent_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('sent_at', filters.dateTo);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by sent_at descending
  query = query.order('sent_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch distributions: ${error.message}`);
  }

  return {
    data: (data as any) || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetDistributions(params: GetDistributionsParams = {}) {
  return useQuery({
    queryKey: ['distributions', params],
    queryFn: () => getDistributions(params),
  });
}
