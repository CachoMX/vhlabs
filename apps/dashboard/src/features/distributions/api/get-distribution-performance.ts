import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DistributionPerformance } from '../types';

async function getDistributionPerformance(): Promise<DistributionPerformance[]> {
  const { data, error } = await supabase
    .from('v_distribution_performance')
    .select('*')
    .order('channel', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch distribution performance: ${error.message}`);
  }

  return data || [];
}

export function useGetDistributionPerformance() {
  return useQuery({
    queryKey: ['distribution-performance'],
    queryFn: getDistributionPerformance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
