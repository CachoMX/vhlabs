import { Badge } from '@/components/ui';
import type { ContentStatus, DistributionStatus } from '@/types';

interface StatusBadgeProps {
  status: ContentStatus | DistributionStatus;
}

const statusConfig: Record<
  ContentStatus | DistributionStatus,
  { variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary'; label: string }
> = {
  pending: { variant: 'warning', label: 'Pending' },
  processing: { variant: 'info', label: 'Processing' },
  ready: { variant: 'success', label: 'Ready' },
  distributed: { variant: 'default', label: 'Distributed' },
  archived: { variant: 'secondary', label: 'Archived' },
  queued: { variant: 'info', label: 'Queued' },
  sent: { variant: 'success', label: 'Sent' },
  delivered: { variant: 'success', label: 'Delivered' },
  failed: { variant: 'error', label: 'Failed' },
  bounced: { variant: 'error', label: 'Bounced' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
