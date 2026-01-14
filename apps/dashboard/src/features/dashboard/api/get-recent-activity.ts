import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

async function fetchRecentActivity(): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch recent activity: ${error.message}`);
  }

  return data || [];
}

export function useGetRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: fetchRecentActivity,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
