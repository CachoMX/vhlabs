import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DistributionFilters } from '../types';

interface ChannelData {
  channel: string;
  sent: number;
}

async function getDistributionChartData(filters: DistributionFilters): Promise<ChannelData[]> {
  const { dateFrom, dateTo, channel } = filters;

  // Use server-side aggregation function to avoid 1000-row limit
  const { data, error } = await (supabase.rpc as any)('get_distributions_by_channel', {
    p_start_date: dateFrom || null,
    p_end_date: dateTo || null,
    p_channel: channel || null,
    p_status: null, // status not in DistributionFilters
  });

  if (error) {
    throw new Error(`Failed to fetch distribution chart data: ${error.message}`);
  }

  return ((data as any) || []).map((item: any) => ({
    channel: item.channel,
    sent: parseInt(item.sent_count),
  }));
}

export function useGetDistributionChartData(filters: DistributionFilters) {
  return useQuery({
    queryKey: ['distributions', 'chart-data', filters],
    queryFn: () => getDistributionChartData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
