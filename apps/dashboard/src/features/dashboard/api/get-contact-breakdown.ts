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

  // Use SQL aggregation function for segments (avoids 1000-record limit)
  const { data: segmentData, error: segmentError } = await supabase
    .rpc('get_segment_counts');

  if (segmentError) {
    throw new Error(`Failed to fetch segments: ${segmentError.message}`);
  }

  const segments: SegmentData[] = (segmentData || []).map((item: any) => ({
    segment: item.segment,
    count: parseInt(item.count),
    percentage: totalContacts > 0 ? (parseInt(item.count) / totalContacts) * 100 : 0,
  }));

  // Use SQL aggregation function for statuses (avoids 1000-record limit)
  const { data: statusData, error: statusError } = await supabase
    .rpc('get_status_counts');

  if (statusError) {
    throw new Error(`Failed to fetch statuses: ${statusError.message}`);
  }

  const statuses: StatusData[] = (statusData || []).map((item: any) => ({
    status: item.investor_status,
    count: parseInt(item.count),
  }));

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
