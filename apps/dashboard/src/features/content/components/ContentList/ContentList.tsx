import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreVertical, Eye, Archive } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Badge, Button, EmptyState } from '@/components/ui';
import { ContentFilters } from '../ContentFilters/ContentFilters';
import { useGetContents } from '../../api/get-contents';
import { useArchiveContent } from '../../api/archive-content';
import type { ContentFilters as ContentFiltersType } from '../../types';
import type { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['contents']['Row'];

interface ContentListProps {
  onViewDetails?: (contentId: string) => void;
}

export function ContentList({ onViewDetails }: ContentListProps) {
  const [filters, setFilters] = useState<ContentFiltersType>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = useGetContents({ filters, page, pageSize });
  const archiveContent = useArchiveContent();

  const handleArchive = async (contentId: string) => {
    if (window.confirm('Are you sure you want to archive this content?')) {
      try {
        await archiveContent.mutateAsync(contentId);
      } catch (err) {
        console.error('Failed to archive content:', err);
        alert('Failed to archive content. Please try again.');
      }
    }
  };

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'ready':
        return 'success';
      case 'processing':
        return 'info';
      case 'distributed':
        return 'success';
      case 'archived':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: ColumnDef<Content>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 truncate">
            {row.original.title || 'Untitled'}
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
      accessorKey: 'source_type',
      header: 'Source Type',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 capitalize">
          {row.original.source_type || 'Unknown'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)} size="sm">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'audiences',
      header: 'Audiences',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.audiences.slice(0, 2).map((audience) => (
            <Badge key={audience} variant="info" size="sm">
              {audience}
            </Badge>
          ))}
          {row.original.audiences.length > 2 && (
            <Badge variant="secondary" size="sm">
              +{row.original.audiences.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.score.toFixed(1)}
        </span>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant={getPriorityVariant(row.original.priority)} size="sm">
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.created_at).toLocaleDateString()}
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
            onClick={() => onViewDetails?.(row.original.id)}
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleArchive(row.original.id)}
            disabled={row.original.status === 'archived' || archiveContent.isPending}
            title="Archive"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error loading contents: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContentFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading contents...</div>
        </div>
      ) : (
        <DataTable
          data={data?.data || []}
          columns={columns}
          pageSize={pageSize}
          emptyState={
            <EmptyState
              title="No content found"
              description="Try adjusting your filters or create new content."
            />
          }
        />
      )}
    </div>
  );
}
