import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { AnalyticsFilters } from '../types';

type WorkflowLog = Database['public']['Tables']['workflow_logs']['Row'];

export interface GetWorkflowsParams {
  filters?: AnalyticsFilters;
  page?: number;
  pageSize?: number;
}

export interface GetWorkflowsResponse {
  data: WorkflowLog[];
  total: number;
  page: number;
  pageSize: number;
}

async function getWorkflows(params: GetWorkflowsParams = {}): Promise<GetWorkflowsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('workflow_logs')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.workflow_name) {
    query = query.eq('workflow_name', filters.workflow_name);
  }

  if (filters.startDate) {
    query = query.gte('started_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('started_at', filters.endDate);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by started_at descending
  query = query.order('started_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch workflow logs: ${error.message}`);
  }

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
  };
}

export function useGetWorkflows(params: GetWorkflowsParams = {}) {
  return useQuery({
    queryKey: ['analytics', 'workflows', params],
    queryFn: () => getWorkflows(params),
  });
}
