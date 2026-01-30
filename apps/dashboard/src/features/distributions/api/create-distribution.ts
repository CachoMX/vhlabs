import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type DistributionInsert = Database['public']['Tables']['distributions']['Insert'];

interface CreateDistributionParams {
  content_id: string;
  ghl_contact_ids: string[];
  channel: 'email' | 'sms' | 'social';
  scheduled_for?: string;
}

/**
 * Create distributions for multiple contacts
 * Sends the same content to multiple contacts via specified channel
 */
export async function createDistributions(params: CreateDistributionParams) {
  const { content_id, ghl_contact_ids, channel, scheduled_for } = params;

  // Create one distribution record per contact
  const distributions: DistributionInsert[] = ghl_contact_ids.map(contact_id => ({
    content_id,
    ghl_contact_id: contact_id,
    channel,
    scheduled_for: scheduled_for || new Date().toISOString(),
    status: scheduled_for ? 'scheduled' : 'sent',
    sent_at: scheduled_for ? null : new Date().toISOString(),
  }));

  const { data, error } = await (supabase as any)
    .from('distributions')
    .insert(distributions)
    .select();

  if (error) {
    throw new Error(`Failed to create distributions: ${error.message}`);
  }

  return data;
}

export function useCreateDistributions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDistributions,
    onSuccess: (_, variables) => {
      // Invalidate distributions queries
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      // Invalidate content query to update distribution count
      queryClient.invalidateQueries({ queryKey: ['content', variables.content_id] });
    },
  });
}
