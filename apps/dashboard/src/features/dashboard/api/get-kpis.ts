import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DashboardKPIs, DashboardFilters } from '../types';

async function fetchKPIs(filters?: DashboardFilters): Promise<DashboardKPIs> {
  // Get total content count
  const { count: totalContent } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true });

  // Get distributions sent in date range
  const { startDate, endDate } = filters || {};
  let distributionsQuery = supabase
    .from('distributions')
    .select('*', { count: 'exact', head: true });

  if (startDate) {
    distributionsQuery = distributionsQuery.gte('sent_at', startDate);
  }
  if (endDate) {
    distributionsQuery = distributionsQuery.lte('sent_at', endDate);
  }

  const { count: distributionsToday } = await distributionsQuery;

  // Get distribution performance metrics
  const { data: perfData } = await supabase
    .from('v_distribution_performance')
    .select('open_rate, response_rate');

  // Calculate average open rate and response rate across all channels
  let avgOpenRate = 0;
  let avgResponseRate = 0;

  if (perfData && perfData.length > 0) {
    const openRates = perfData.map((d: any) => d.open_rate || 0).filter(rate => rate > 0);
    const responseRates = perfData.map((d: any) => d.response_rate || 0).filter(rate => rate > 0);

    avgOpenRate = openRates.length > 0
      ? openRates.reduce((sum, rate) => sum + rate, 0) / openRates.length
      : 0;

    avgResponseRate = responseRates.length > 0
      ? responseRates.reduce((sum, rate) => sum + rate, 0) / responseRates.length
      : 0;
  }

  return {
    totalContent: totalContent || 0,
    distributionsToday: distributionsToday || 0,
    openRate: Math.round(avgOpenRate * 100) / 100,
    responseRate: Math.round(avgResponseRate * 100) / 100,
  };
}

export function useGetKPIs(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', filters],
    queryFn: () => fetchKPIs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
