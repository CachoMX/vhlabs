import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Select, Input, Button, type SelectOption } from '@/components/ui';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { ContactFilters as ContactFiltersType } from '../../types';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: ContactFiltersType) => void;
}

const segmentOptions: SelectOption[] = [
  { value: '', label: 'All Segments' },
  { value: 'general_leads', label: 'General Leads' },
  { value: 'jv_partners', label: 'JV Partners' },
  { value: 'lenders', label: 'Lenders' },
  { value: 'coaching_students', label: 'Coaching Students' },
  { value: 'sellers', label: 'Sellers' },
];

const investorStatusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'hot_lead', label: 'Hot Lead' },
  { value: 'active_investor', label: 'Active Investor' },
  { value: 'jv_potential', label: 'JV Potential' },
  { value: 'passive_investor', label: 'Passive Investor' },
  { value: 'objection_holder', label: 'Objection Holder' },
  { value: 'tire_kicker', label: 'Tire Kicker' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'cold', label: 'Cold' },
  { value: 'general_leads', label: 'General Leads' },
];

export function ContactFilters({ filters, onFiltersChange }: ContactFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch || undefined,
    });
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

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

  const handleExcludeScoreMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      excludeScoreMin: value ? parseInt(value, 10) : undefined,
    });
  };

  const handleExcludeScoreMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      excludeScoreMax: value ? parseInt(value, 10) : undefined,
    });
  };

  const toggleExcludeSegment = (segment: string) => {
    const current = filters.excludeSegments || [];
    const newExcludeSegments = current.includes(segment)
      ? current.filter(s => s !== segment)
      : [...current, segment];
    onFiltersChange({
      ...filters,
      excludeSegments: newExcludeSegments.length > 0 ? newExcludeSegments : undefined,
    });
  };

  const toggleExcludeStatus = (status: string) => {
    const current = filters.excludeStatuses || [];
    const newExcludeStatuses = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onFiltersChange({
      ...filters,
      excludeStatuses: newExcludeStatuses.length > 0 ? newExcludeStatuses : undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.segment ||
    filters.investor_status ||
    filters.scoreMin !== undefined ||
    filters.scoreMax !== undefined ||
    (filters.excludeSegments && filters.excludeSegments.length > 0) ||
    (filters.excludeStatuses && filters.excludeStatuses.length > 0) ||
    filters.excludeScoreMin !== undefined ||
    filters.excludeScoreMax !== undefined
  );

  return (
    <div className="space-y-4">
      {/* Search and Basic Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[300px]">
          <Input
            type="text"
            label="Search"
            placeholder="Search by name, email, or phone..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters - Exclusions */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-red-200 to-transparent"></div>
            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Exclusion Filters</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-red-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exclude Segments */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Exclude Segments
              </label>
              <div className="flex gap-2 flex-wrap">
                {segmentOptions.slice(1).map((option) => {
                  const isExcluded = filters.excludeSegments?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleExcludeSegment(option.value)}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                        ${isExcluded
                          ? 'bg-red-500 text-white shadow-md hover:bg-red-600'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300 hover:bg-red-50'
                        }
                      `}
                    >
                      {isExcluded && <X className="inline h-3 w-3 mr-1" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {filters.excludeSegments && filters.excludeSegments.length > 0 && (
                <p className="text-xs text-red-600 font-medium">
                  Excluding {filters.excludeSegments.length} segment{filters.excludeSegments.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Exclude Statuses */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Exclude Investor Statuses
              </label>
              <div className="flex gap-2 flex-wrap">
                {investorStatusOptions.slice(1).map((option) => {
                  const isExcluded = filters.excludeStatuses?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleExcludeStatus(option.value)}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                        ${isExcluded
                          ? 'bg-red-500 text-white shadow-md hover:bg-red-600'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-red-300 hover:bg-red-50'
                        }
                      `}
                    >
                      {isExcluded && <X className="inline h-3 w-3 mr-1" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {filters.excludeStatuses && filters.excludeStatuses.length > 0 && (
                <p className="text-xs text-red-600 font-medium">
                  Excluding {filters.excludeStatuses.length} status{filters.excludeStatuses.length > 1 ? 'es' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Exclude Score Range */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Exclude Score Range
            </label>
            <div className="flex gap-4 items-center">
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Min"
                  min={0}
                  max={100}
                  value={filters.excludeScoreMin ?? ''}
                  onChange={handleExcludeScoreMinChange}
                />
              </div>
              <span className="text-gray-400 font-medium">to</span>
              <div className="w-32">
                <Input
                  type="number"
                  placeholder="Max"
                  min={0}
                  max={100}
                  value={filters.excludeScoreMax ?? ''}
                  onChange={handleExcludeScoreMaxChange}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">
                  {(filters.excludeScoreMin !== undefined || filters.excludeScoreMax !== undefined) ? (
                    <span className="text-red-600 font-medium">
                      Excluding contacts with scores {filters.excludeScoreMin ?? 0}-{filters.excludeScoreMax ?? 100}
                    </span>
                  ) : (
                    'Enter range to exclude contacts by score'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
