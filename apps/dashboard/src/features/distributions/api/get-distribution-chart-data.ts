import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DistributionFilters } from '../types';

interface ChannelData {
  channel: string;
  sent: number;
}

async function getDistributionChartData(filters: DistributionFilters): Promise<ChannelData[]> {
  const { startDate, endDate, channel, status } = filters;

  // Use server-side aggregation function to avoid 1000-row limit
  const { data, error } = await supabase.rpc('get_distributions_by_channel', {
    p_start_date: startDate || null,
    p_end_date: endDate || null,
    p_channel: channel || null,
    p_status: status || null,
  });

  if (error) {
    throw new Error(`Failed to fetch distribution chart data: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
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
