import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ContactSync, Distribution, ContactDetailData } from '../types';

async function getContact(id: string): Promise<ContactDetailData> {
  // Fetch contact details
  const { data: contact, error: contactError } = await supabase
    .from('contacts_sync')
    .select('*')
    .eq('id', id)
    .single();

  if (contactError) {
    throw new Error(`Failed to fetch contact: ${contactError.message}`);
  }

  if (!contact) {
    throw new Error('Contact not found');
  }

  // Fetch recent distributions for this contact
  const { data: distributions, error: distributionsError } = await supabase
    .from('distributions')
    .select('*')
    .eq('contact_sync_id', id)
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
