import { Select, type SelectOption } from '@/components/ui';
import type { DashboardFilters as DashboardFiltersType } from '../../types';

interface DashboardFiltersProps {
  filters: DashboardFiltersType;
  onFiltersChange: (filters: DashboardFiltersType) => void;
}

const presetOptions: SelectOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

function getDateRangeFromPreset(preset: string): { startDate: string; endDate: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let startDate: Date;
  let endDate: Date = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  switch (preset) {
    case 'today':
      startDate = new Date(today);
      break;
    case 'yesterday':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'last7days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6);
      break;
    case 'last30days':
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(today);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as DashboardFiltersType['preset'];

    if (preset === 'custom') {
      onFiltersChange({ ...filters, preset });
    } else if (preset) {
      const dateRange = getDateRangeFromPreset(preset);
      onFiltersChange({
        preset,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    date.setHours(0, 0, 0, 0);
    onFiltersChange({
      ...filters,
      preset: 'custom',
      startDate: date.toISOString(),
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    date.setHours(23, 59, 59, 999);
    onFiltersChange({
      ...filters,
      preset: 'custom',
      endDate: date.toISOString(),
    });
  };

  const formatDateForInput = (isoString?: string) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-4 flex-wrap items-end">
        <div className="w-48">
          <Select
            label="Date Range"
            options={presetOptions}
            value={filters.preset || 'today'}
            onChange={handlePresetChange}
          />
        </div>

        {filters.preset === 'custom' && (
          <>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formatDateForInput(filters.startDate)}
                onChange={handleStartDateChange}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formatDateForInput(filters.endDate)}
                onChange={handleEndDateChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
