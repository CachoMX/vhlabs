import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ContactFilters, ContactOverview } from '../types';

export interface GetContactsParams {
  filters?: ContactFilters;
  page?: number;
  pageSize?: number;
}

export interface GetContactsResponse {
  data: ContactOverview[];
  total: number;
  page: number;
  pageSize: number;
}

async function getContacts(params: GetContactsParams = {}): Promise<GetContactsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('v_contact_overview')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.segment) {
    query = query.eq('segment', filters.segment);
  }

  if (filters.investor_status) {
    query = query.eq('investor_status', filters.investor_status);
  }

  if (filters.scoreMin !== undefined) {
    query = query.gte('score', filters.scoreMin);
  }

  if (filters.scoreMax !== undefined) {
    query = query.lte('score', filters.scoreMax);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by score descending, then last_touchpoint_at descending
  query = query.order('score', { ascending: false });
  query = query.order('last_touchpoint_at', { ascending: false, nullsFirst: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetContacts(params: GetContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => getContacts(params),
  });
}
