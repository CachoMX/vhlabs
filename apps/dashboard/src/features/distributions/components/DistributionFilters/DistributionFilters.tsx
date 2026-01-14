import React from 'react';
import { Input, Select } from '@/components/ui';
import type { DistributionFilters as Filters } from '../../types';

interface DistributionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const channelOptions = [
  { value: '', label: 'All Channels' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' },
];

export const DistributionFilters: React.FC<DistributionFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      channel: e.target.value || undefined,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateFrom: e.target.value || undefined,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      dateTo: e.target.value || undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Select
          id="channel"
          label="Channel"
          value={filters.channel || ''}
          onChange={handleChannelChange}
          options={channelOptions}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Input
          id="dateFrom"
          label="From Date"
          type="date"
          value={filters.dateFrom || ''}
          onChange={handleDateFromChange}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Input
          id="dateTo"
          label="To Date"
          type="date"
          value={filters.dateTo || ''}
          onChange={handleDateToChange}
        />
      </div>
    </div>
  );
};

DistributionFilters.displayName = 'DistributionFilters';
