import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { DistributionFilters } from '../types';

type Distribution = Database['public']['Tables']['distributions']['Row'];

type ContactData = {
  ghl_id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
};

export interface DistributionWithContact extends Distribution {
  contact?: ContactData | null;
}

export interface GetDistributionsParams {
  filters?: DistributionFilters;
  page?: number;
  pageSize?: number;
}

export interface GetDistributionsResponse {
  data: DistributionWithContact[];
  total: number;
  page: number;
  pageSize: number;
}

async function getDistributions(params: GetDistributionsParams = {}): Promise<GetDistributionsResponse> {
  const { filters = {}, page = 1, pageSize = 10 } = params;

  let query = supabase
    .from('distributions')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.channel) {
    query = query.eq('channel', filters.channel);
  }

  if (filters.dateFrom) {
    query = query.gte('sent_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('sent_at', filters.dateTo);
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by sent_at descending
  query = query.order('sent_at', { ascending: false });

  const { data: distributions, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch distributions: ${error.message}`);
  }

  if (!distributions || distributions.length === 0) {
    return {
      data: [],
      total: count || 0,
      page,
      pageSize,
    };
  }

  // Get unique ghl_contact_ids
  const ghlContactIds = [...new Set((distributions as Distribution[]).map(d => d.ghl_contact_id).filter(Boolean))];

  // Fetch contacts by ghl_id
  let contactsData: ContactData[] = [];
  if (ghlContactIds.length > 0) {
    const { data: contacts } = await supabase
      .from('contacts_sync')
      .select('ghl_id, email, phone, first_name, last_name')
      .in('ghl_id', ghlContactIds);

    contactsData = (contacts || []) as ContactData[];
  }

  // Map contacts to distributions
  const contactMap = new Map<string, ContactData>(contactsData.map(c => [c.ghl_id, c]));

  let distributionsWithContacts: DistributionWithContact[] = (distributions as Distribution[]).map(dist => ({
    ...dist,
    contact: dist.ghl_contact_id ? contactMap.get(dist.ghl_contact_id) || null : null,
  }));

  // Apply search filter (client-side filtering after joining contacts)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    distributionsWithContacts = distributionsWithContacts.filter(dist => {
      if (!dist.contact) return false;

      const name = `${dist.contact.first_name || ''} ${dist.contact.last_name || ''}`.toLowerCase();
      const email = (dist.contact.email || '').toLowerCase();
      const phone = (dist.contact.phone || '').toLowerCase();

      return name.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
    });
  }

  return {
    data: distributionsWithContacts,
    total: filters.search ? distributionsWithContacts.length : count || 0,
    page,
    pageSize,
  };
}

export function useGetDistributions(params: GetDistributionsParams = {}) {
  return useQuery({
    queryKey: ['distributions', params],
    queryFn: () => getDistributions(params),
  });
}
