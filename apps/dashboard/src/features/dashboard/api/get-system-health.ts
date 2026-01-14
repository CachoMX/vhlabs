import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type WorkflowLog = Database['public']['Tables']['workflow_logs']['Row'];

export interface SystemHealthData {
  errorLogs: WorkflowLog[];
  errorCount: number;
  latestErrorTime: string | null;
}

async function fetchSystemHealth(): Promise<SystemHealthData> {
  const { data, error } = await supabase
    .from('workflow_logs')
    .select('*')
    .eq('status', 'error')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to fetch system health: ${error.message}`);
  }

  const errorLogs = data || [];
  const errorCount = errorLogs.length;
  const latestErrorTime = errorLogs.length > 0 ? errorLogs[0].created_at : null;

  return {
    errorLogs,
    errorCount,
    latestErrorTime,
  };
}

export function useGetSystemHealth() {
  return useQuery({
    queryKey: ['dashboard', 'system-health'],
    queryFn: fetchSystemHealth,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
