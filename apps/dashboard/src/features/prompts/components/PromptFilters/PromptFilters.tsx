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
  { value: 'setter', label: 'Setter' },
  { value: 'response_handling', label: 'Response Handling' },
  { value: 'note_parsing', label: 'Note Parsing' },
  { value: 'operations', label: 'Operations' },
  { value: 'distribution', label: 'Distribution' },
  { value: 'content_processing', label: 'Content Processing' },
  { value: 'content_extraction', label: 'Content Extraction' },
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
