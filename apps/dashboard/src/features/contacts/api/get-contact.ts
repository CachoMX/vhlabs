import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ContactSync as _ContactSync, Distribution as _Distribution, ContactDetailData } from '../types';

async function getContact(id: string): Promise<ContactDetailData> {
  // Fetch contact details with segment and status names
  const { data: contact, error: contactError } = await supabase
    .from('contacts_sync')
    .select(`
      *,
      segment_info:segments!contacts_sync_segment_fkey(name),
      status_info:investor_statuses!contacts_sync_investor_status_fkey(name)
    `)
    .eq('id', id)
    .single();

  if (contactError) {
    throw new Error(`Failed to fetch contact: ${contactError.message}`);
  }

  if (!contact) {
    throw new Error('Contact not found');
  }

  // Fetch recent distributions for this contact using ghl_contact_id (since contact_sync_id is null)
  const { data: distributions, error: distributionsError } = await supabase
    .from('distributions')
    .select('*')
    .eq('ghl_contact_id', contact.ghl_id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (distributionsError) {
    throw new Error(`Failed to fetch distributions: ${distributionsError.message}`);
  }

  return {
    contact,
    distributions: distributions || [],
  };
}

export function useGetContact(id: string) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => getContact(id),
    enabled: !!id,
  });
}
