import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SegmentData {
  segment: string;
  count: number;
  percentage: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface ContactBreakdownData {
  segments: SegmentData[];
  statuses: StatusData[];
  totalContacts: number;
}

async function getContactBreakdown(): Promise<ContactBreakdownData> {
  // Get total contacts count
  const { count: totalCount, error: countError } = await supabase
    .from('contacts_sync')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to fetch contact count: ${countError.message}`);
  }

  const totalContacts = totalCount || 0;

  // Get segment breakdown
  const { data: segmentData, error: segmentError } = await supabase
    .from('contacts_sync')
    .select('segment');

  if (segmentError) {
    throw new Error(`Failed to fetch segments: ${segmentError.message}`);
  }

  // Count segments
  const segmentCounts: Record<string, number> = {};
  (segmentData || []).forEach((contact) => {
    const segment = contact.segment || 'unassigned';
    segmentCounts[segment] = (segmentCounts[segment] || 0) + 1;
  });

  const segments: SegmentData[] = Object.entries(segmentCounts)
    .map(([segment, count]) => ({
      segment,
      count,
      percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Get status breakdown
  const { data: statusData, error: statusError } = await supabase
    .from('contacts_sync')
    .select('investor_status');

  if (statusError) {
    throw new Error(`Failed to fetch statuses: ${statusError.message}`);
  }

  // Count statuses
  const statusCounts: Record<string, number> = {};
  (statusData || []).forEach((contact) => {
    const status = contact.investor_status || 'unassigned';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const statuses: StatusData[] = Object.entries(statusCounts)
    .map(([status, count]) => ({
      status,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    segments,
    statuses,
    totalContacts,
  };
}

export function useGetContactBreakdown() {
  return useQuery({
    queryKey: ['dashboard', 'contact-breakdown'],
    queryFn: () => getContactBreakdown(),
  });
}
