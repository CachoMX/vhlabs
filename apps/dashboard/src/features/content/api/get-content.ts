import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['contents']['Row'];

async function getContent(id: string): Promise<Content> {
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch content: ${error.message}`);
  }

  if (!data) {
    throw new Error('Content not found');
  }

  return data;
}

export function useGetContent(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => getContent(id),
    enabled: !!id,
  });
}
