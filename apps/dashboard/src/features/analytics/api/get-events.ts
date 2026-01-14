import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { AnalyticsFilters } from '../types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

export interface GetEventsParams {
  filters?: AnalyticsFilters;
  page?: number;
  pageSize?: number;
}

export interface GetEventsResponse {
  data: AnalyticsEvent[];
  total: number;
  page: number;
  pageSize: number;
}

async function getEvents(params: GetEventsParams = {}): Promise<GetEventsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('analytics_events')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }

  if (filters.event_category) {
    query = query.eq('event_category', filters.event_category);
  }

  if (filters.workflow_name) {
    query = query.eq('workflow_name', filters.workflow_name);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by created_at descending
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch analytics events: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetEvents(params: GetEventsParams = {}) {
  return useQuery({
    queryKey: ['analytics', 'events', params],
    queryFn: () => getEvents(params),
  });
}
