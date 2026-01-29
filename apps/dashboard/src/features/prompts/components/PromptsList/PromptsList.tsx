import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, Edit, Power } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Badge, Button, EmptyState } from '@/components/ui';
import { PromptFilters } from '../PromptFilters/PromptFilters';
import { useGetPrompts } from '../../api/get-prompts';
import { useTogglePromptActive } from '../../api/toggle-prompt-active';
import type { PromptFilters as PromptFiltersType } from '../../types';
import type { Database } from '@/types/database.types';

type Prompt = Database['public']['Tables']['prompts']['Row'];

interface PromptsListProps {
  onEdit?: (promptId: string) => void;
  onDuplicate?: (prompt: Prompt) => void;
}

export function PromptsList({ onEdit, onDuplicate }: PromptsListProps) {
  const [filters, setFilters] = useState<PromptFiltersType>({});
  const [page, _setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useGetPrompts({ filters, page, pageSize });
  const toggleActive = useTogglePromptActive();

  const handleToggleActive = async (promptId: string, currentStatus: boolean) => {
    try {
      await toggleActive.mutateAsync({
        id: promptId,
        isActive: !currentStatus,
      });
    } catch (err) {
      console.error('Failed to toggle prompt active status:', err);
      alert('Failed to toggle prompt active status. Please try again.');
    }
  };

  const columns: ColumnDef<Prompt>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">
            {row.original.name}
          </div>
          {row.original.description && (
            <div className="text-sm text-gray-500 truncate mt-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'system',
      header: 'System',
      cell: ({ row }) => (
        <Badge variant="info" size="sm">
          {row.original.system}
        </Badge>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 capitalize">
          {row.original.category || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          v{row.original.version}
        </span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'default'} size="sm">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.updated_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(row.original.id)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate?.(row.original)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(row.original.id, row.original.is_active)}
            disabled={toggleActive.isPending}
            title={row.original.is_active ? 'Deactivate' : 'Activate'}
          >
            <Power className={`h-4 w-4 ${row.original.is_active ? 'text-green-600' : 'text-gray-400'}`} />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading prompts: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PromptFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading prompts...</div>
        </div>
      ) : (
        <DataTable
          data={data?.data || []}
          columns={columns}
          pageSize={pageSize}
          emptyState={
            <EmptyState
              title="No prompts found"
              description="Try adjusting your filters or create a new prompt."
            />
          }
        />
      )}
    </div>
  );
}
