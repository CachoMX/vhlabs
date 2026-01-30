import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DashboardFilters } from '../types';

interface EngagementData {
  date: string;
  sent: number;
  responses: number;
  responseRate: number;
}

async function getEngagementTrends(filters: DashboardFilters): Promise<EngagementData[]> {
  const { startDate, endDate } = filters;

  // Get distributions grouped by date
  let query = supabase
    .from('distributions')
    .select('sent_at, response_received');

  if (startDate) {
    query = query.gte('sent_at', startDate);
  }

  if (endDate) {
    query = query.lte('sent_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch engagement trends: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Group by date
  const grouped: Record<string, { sent: number; responses: number }> = {};

  (data as any[]).forEach((dist) => {
    if (!dist.sent_at) return;

    const date = new Date(dist.sent_at).toISOString().split('T')[0];

    if (!grouped[date]) {
      grouped[date] = { sent: 0, responses: 0 };
    }

    grouped[date].sent++;
    if (dist.response_received) {
      grouped[date].responses++;
    }
  });

  // Convert to array and calculate response rates
  const trends: EngagementData[] = Object.entries(grouped)
    .map(([date, stats]) => ({
      date,
      sent: stats.sent,
      responses: stats.responses,
      responseRate: stats.sent > 0 ? (stats.responses / stats.sent) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trends;
}

export function useGetEngagementTrends(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', 'engagement-trends', filters],
    queryFn: () => getEngagementTrends(filters),
  });
}
