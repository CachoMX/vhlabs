import { Select, type SelectOption } from '@/components/ui';
import type { PromptFilters as PromptFiltersType } from '../../types';

interface PromptFiltersProps {
  filters: PromptFiltersType;
  onFiltersChange: (filters: PromptFiltersType) => void;
}

const systemOptions: SelectOption[] = [
  { value: '', label: 'All Systems' },
  { value: 'system1', label: 'System 1' },
  { value: 'system2', label: 'System 2' },
  { value: 'system3', label: 'System 3' },
  { value: 'system4', label: 'System 4' },
];

const categoryOptions: SelectOption[] = [
  { value: '', label: 'All Categories' },
  { value: 'content-generation', label: 'Content Generation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'summarization', label: 'Summarization' },
  { value: 'classification', label: 'Classification' },
  { value: 'extraction', label: 'Extraction' },
];

export function PromptFilters({ filters, onFiltersChange }: PromptFiltersProps) {
  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      system: e.target.value || undefined,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      category: e.target.value || undefined,
    });
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <div className="w-48">
        <Select
          label="System"
          options={systemOptions}
          value={filters.system || ''}
          onChange={handleSystemChange}
        />
      </div>
      <div className="w-48">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters.category || ''}
          onChange={handleCategoryChange}
        />
      </div>
    </div>
  );
}
