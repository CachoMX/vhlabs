import { Select, type SelectOption } from '@/components/ui';
import type { ContentFilters as ContentFiltersType } from '../../types';

interface ContentFiltersProps {
  filters: ContentFiltersType;
  onFiltersChange: (filters: ContentFiltersType) => void;
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'distributed', label: 'Distributed' },
  { value: 'archived', label: 'Archived' },
];

const priorityOptions: SelectOption[] = [
  { value: '', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const audienceOptions: SelectOption[] = [
  { value: '', label: 'All Audiences' },
  { value: 'accredited-investors', label: 'Accredited Investors' },
  { value: 'passive-investors', label: 'Passive Investors' },
  { value: 'active-investors', label: 'Active Investors' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'family-offices', label: 'Family Offices' },
];

export function ContentFilters({ filters, onFiltersChange }: ContentFiltersProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value ? (e.target.value as ContentFiltersType['status']) : undefined,
    });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      priority: e.target.value ? (e.target.value as ContentFiltersType['priority']) : undefined,
    });
  };

  const handleAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      audience: e.target.value || undefined,
    });
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="w-48">
        <Select
          label="Status"
          options={statusOptions}
          value={filters.status || ''}
          onChange={handleStatusChange}
        />
      </div>
      <div className="w-48">
        <Select
          label="Priority"
          options={priorityOptions}
          value={filters.priority || ''}
          onChange={handlePriorityChange}
        />
      </div>
      <div className="w-48">
        <Select
          label="Audience"
          options={audienceOptions}
          value={filters.audience || ''}
          onChange={handleAudienceChange}
        />
      </div>
    </div>
  );
}
