import type { Database } from '@/types/database.types';

type ContactOverview = Database['public']['Views']['v_contact_overview']['Row'];
type ContactSync = Database['public']['Tables']['contacts_sync']['Row'];
type Distribution = Database['public']['Tables']['distributions']['Row'];
type VoiceCall = Database['public']['Tables']['voice_calls']['Row'];

export interface ContactFilters {
  // Search
  search?: string;

  // Inclusion filters
  segment?: string;
  investor_status?: string;
  scoreMin?: number;
  scoreMax?: number;

  // Exclusion filters
  excludeSegments?: string[];
  excludeStatuses?: string[];
  excludeScoreMin?: number;
  excludeScoreMax?: number;
}

export interface ContactDetailData {
  contact: ContactSync;
  distributions: Distribution[];
  voiceCalls: VoiceCall[];
}

export type { ContactOverview, ContactSync, Distribution, VoiceCall };
