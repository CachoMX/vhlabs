import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Hook = Database['public']['Tables']['hooks']['Row'];

async function getContentHooks(contentId: string): Promise<Hook[]> {
  const { data, error } = await supabase
    .from('hooks')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch content hooks: ${error.message}`);
  }

  return data || [];
}

export function useGetContentHooks(contentId: string) {
  return useQuery({
    queryKey: ['content-hooks', contentId],
    queryFn: () => getContentHooks(contentId),
    enabled: !!contentId,
  });
}
