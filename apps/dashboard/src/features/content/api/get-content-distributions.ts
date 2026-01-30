import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Distribution = Database['public']['Tables']['distributions']['Row'];

async function getContentDistributions(contentId: string): Promise<Distribution[]> {
  const { data, error } = await supabase
    .from('distributions')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch content distributions: ${error.message}`);
  }

  return data || [];
}

export function useGetContentDistributions(contentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['content', contentId, 'distributions'],
    queryFn: () => getContentDistributions(contentId),
    enabled: enabled && !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
