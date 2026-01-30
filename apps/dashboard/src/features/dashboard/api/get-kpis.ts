import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { DashboardKPIs, DashboardFilters } from '../types';

type DistributionPerformance = Database['public']['Views']['v_distribution_performance']['Row'];

async function fetchKPIs(filters?: DashboardFilters): Promise<DashboardKPIs> {
  // Get total content count
  const { count: totalContent, error: contentError } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true });

  if (contentError) {
    throw new Error(`Failed to fetch content count: ${contentError.message}`);
  }

  // Get emails and SMS sent in date range
  const { startDate, endDate } = filters || {};

  // Query for emails
  let emailsQuery = supabase
    .from('distributions')
    .select('*', { count: 'exact', head: true })
    .eq('channel', 'email');

  if (startDate) {
    emailsQuery = emailsQuery.gte('sent_at', startDate);
  }
  if (endDate) {
    emailsQuery = emailsQuery.lte('sent_at', endDate);
  }

  const { count: emailsSent, error: emailsError } = await emailsQuery;

  if (emailsError) {
    throw new Error(`Failed to fetch emails count: ${emailsError.message}`);
  }

  // Query for SMS
  let smsQuery = supabase
    .from('distributions')
    .select('*', { count: 'exact', head: true })
    .eq('channel', 'sms');

  if (startDate) {
    smsQuery = smsQuery.gte('sent_at', startDate);
  }
  if (endDate) {
    smsQuery = smsQuery.lte('sent_at', endDate);
  }

  const { count: smsSent, error: smsError } = await smsQuery;

  if (smsError) {
    throw new Error(`Failed to fetch SMS count: ${smsError.message}`);
  }

  // Get distribution performance metrics
  const { data: perfData, error: perfError } = await supabase
    .from('v_distribution_performance')
    .select('open_rate, response_rate');

  if (perfError) {
    throw new Error(`Failed to fetch performance data: ${perfError.message}`);
  }

  // Calculate average open rate and response rate across all channels
  let avgOpenRate = 0;
  let avgResponseRate = 0;

  if (perfData && perfData.length > 0) {
    const openRates = (perfData as DistributionPerformance[])
      .map((d) => d.open_rate || 0)
      .filter(rate => rate > 0);
    const responseRates = (perfData as DistributionPerformance[])
      .map((d) => d.response_rate || 0)
      .filter(rate => rate > 0);

    avgOpenRate = openRates.length > 0
      ? openRates.reduce((sum, rate) => sum + rate, 0) / openRates.length
      : 0;

    avgResponseRate = responseRates.length > 0
      ? responseRates.reduce((sum, rate) => sum + rate, 0) / responseRates.length
      : 0;
  }

  return {
    totalContent: totalContent || 0,
    emailsSent: emailsSent || 0,
    smsSent: smsSent || 0,
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
