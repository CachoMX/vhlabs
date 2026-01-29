import { Input, Select, Button } from '@/components/ui';
import type { AnalyticsFilters as AnalyticsFiltersType } from '../../types';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
  mode?: 'events' | 'workflows';
}

export function AnalyticsFilters({ filters, onFiltersChange, mode = 'events' }: AnalyticsFiltersProps) {
  const handleFilterChange = (key: keyof AnalyticsFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mode === 'events' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <Input
                type="text"
                placeholder="Filter by event type"
                value={filters.event_type || ''}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Category
              </label>
              <Input
                type="text"
                placeholder="Filter by category"
                value={filters.event_category || ''}
                onChange={(e) => handleFilterChange('event_category', e.target.value)}
              />
            </div>
          </>
        )}

        {mode === 'workflows' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'running', label: 'Running' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workflow Name
          </label>
          <Input
            type="text"
            placeholder="Filter by workflow"
            value={filters.workflow_name || ''}
            onChange={(e) => handleFilterChange('workflow_name', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
