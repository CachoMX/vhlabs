import { Select, Input, type SelectOption } from '@/components/ui';
import type { ContactFilters as ContactFiltersType } from '../../types';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: ContactFiltersType) => void;
}

const segmentOptions: SelectOption[] = [
  { value: '', label: 'All Segments' },
  { value: 'warm-leads', label: 'Warm Leads' },
  { value: 'current-investors', label: 'Current Investors' },
  { value: 'vip', label: 'VIP' },
  { value: 'inactive', label: 'Inactive' },
];

const investorStatusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'committed', label: 'Committed' },
  { value: 'investor', label: 'Investor' },
  { value: 'inactive', label: 'Inactive' },
];

export function ContactFilters({ filters, onFiltersChange }: ContactFiltersProps) {
  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      segment: e.target.value || undefined,
    });
  };

  const handleInvestorStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      investor_status: e.target.value || undefined,
    });
  };

  const handleScoreMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      scoreMin: value ? parseInt(value, 10) : undefined,
    });
  };

  const handleScoreMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      scoreMax: value ? parseInt(value, 10) : undefined,
    });
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="w-48">
        <Select
          label="Segment"
          options={segmentOptions}
          value={filters.segment || ''}
          onChange={handleSegmentChange}
        />
      </div>
      <div className="w-48">
        <Select
          label="Investor Status"
          options={investorStatusOptions}
          value={filters.investor_status || ''}
          onChange={handleInvestorStatusChange}
        />
      </div>
      <div className="w-32">
        <Input
          type="number"
          label="Min Score"
          placeholder="0"
          min={0}
          max={100}
          value={filters.scoreMin ?? ''}
          onChange={handleScoreMinChange}
        />
      </div>
      <div className="w-32">
        <Input
          type="number"
          label="Max Score"
          placeholder="100"
          min={0}
          max={100}
          value={filters.scoreMax ?? ''}
          onChange={handleScoreMaxChange}
        />
      </div>
    </div>
  );
}
