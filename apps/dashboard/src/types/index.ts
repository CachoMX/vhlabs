// Shared type definitions

export type ContentStatus = 'pending' | 'processing' | 'ready' | 'distributed' | 'archived';
export type ContentPriority = 'high' | 'medium' | 'low';
export type DistributionChannel = 'email' | 'sms' | 'instagram' | 'linkedin' | 'slack';
export type DistributionStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced';

export interface Segment {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
}

export interface InvestorStatus {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priority_level: number;
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}
