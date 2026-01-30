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

  // Apply inclusion filters
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

  // Apply exclusion filters
  if (filters.excludeSegments && filters.excludeSegments.length > 0) {
    query = query.not('segment', 'in', `(${filters.excludeSegments.join(',')})`);
  }

  if (filters.excludeStatuses && filters.excludeStatuses.length > 0) {
    query = query.not('investor_status', 'in', `(${filters.excludeStatuses.join(',')})`);
  }

  // Apply search filter (search in name, email, phone)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);
  }

  // Apply score exclusion filter server-side if needed
  if (filters.excludeScoreMin !== undefined && filters.excludeScoreMax !== undefined) {
    // Exclude scores within range (NOT between excludeMin and excludeMax)
    query = query.or(`score.lt.${filters.excludeScoreMin},score.gt.${filters.excludeScoreMax}`);
  } else if (filters.excludeScoreMin !== undefined) {
    query = query.lt('score', filters.excludeScoreMin);
  } else if (filters.excludeScoreMax !== undefined) {
    query = query.gt('score', filters.excludeScoreMax);
  }

  // Order by score descending, then last_touchpoint_at descending
  query = query.order('score', { ascending: false });
  query = query.order('last_touchpoint_at', { ascending: false, nullsFirst: false });

  // Apply server-side pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

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

/**
 * Export all contacts matching filters (no pagination)
 * Used for CSV/JSON exports
 */
export async function exportContacts(filters: ContactFilters = {}): Promise<ContactOverview[]> {
  let query = supabase
    .from('v_contact_overview')
    .select('*');

  // Apply same filters as getContacts
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

  if (filters.excludeSegments && filters.excludeSegments.length > 0) {
    query = query.not('segment', 'in', `(${filters.excludeSegments.join(',')})`);
  }

  if (filters.excludeStatuses && filters.excludeStatuses.length > 0) {
    query = query.not('investor_status', 'in', `(${filters.excludeStatuses.join(',')})`);
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);
  }

  if (filters.excludeScoreMin !== undefined && filters.excludeScoreMax !== undefined) {
    query = query.or(`score.lt.${filters.excludeScoreMin},score.gt.${filters.excludeScoreMax}`);
  } else if (filters.excludeScoreMin !== undefined) {
    query = query.lt('score', filters.excludeScoreMin);
  } else if (filters.excludeScoreMax !== undefined) {
    query = query.gt('score', filters.excludeScoreMax);
  }

  // Order by score descending
  query = query.order('score', { ascending: false });
  query = query.order('last_touchpoint_at', { ascending: false, nullsFirst: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to export contacts: ${error.message}`);
  }

  return data || [];
}
