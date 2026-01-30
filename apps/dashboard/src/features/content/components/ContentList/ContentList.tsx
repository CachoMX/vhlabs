import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Archive, Download } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { Badge, Button, EmptyState, SkeletonTable, Card } from '@/components/ui';
import { ContentFilters } from '../ContentFilters/ContentFilters';
import { useGetContents, exportContents } from '../../api/get-contents';
import { useArchiveContent } from '../../api/archive-content';
import { downloadCSV } from '@/utils/export';
import type { ContentFilters as ContentFiltersType } from '../../types';
import type { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['contents']['Row'];

interface ContentListProps {
  onViewDetails?: (contentId: string) => void;
}

export function ContentList({ onViewDetails }: ContentListProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<ContentFiltersType>(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const audience = searchParams.get('audience') || undefined;

    return {
      status: statusParam as ContentFiltersType['status'],
      priority: priorityParam as ContentFiltersType['priority'],
      audience,
    };
  });

  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const pageSize = 10;

  // Sync URL params with filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.audience) params.set('audience', filters.audience);
    if (page !== 1) params.set('page', page.toString());

    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  const { data, isLoading, error } = useGetContents({ filters, page, pageSize });
  const archiveContent = useArchiveContent();

  const handleArchive = async (contentId: string) => {
    toast.promise(
      archiveContent.mutateAsync(contentId),
      {
        loading: 'Archiving content...',
        success: 'Content archived successfully',
        error: 'Failed to archive content. Please try again.',
      }
    );
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting all content...', { id: 'export' });

      // Fetch ALL content with current filters (no pagination)
      const allContent = await exportContents(filters);

      const exportData = allContent.map(content => ({
        'Title': content.title || '',
        'Description': content.description || '',
        'Transcript Preview': content.transcript_raw ? content.transcript_raw.substring(0, 200) : '',
        'Status': content.status || '',
        'Source Type': content.source_type || '',
        'Source URL': content.source_url || '',
        'Audience': Array.isArray(content.audiences) ? content.audiences.join(', ') : '',
        'Score': content.score || 0,
        'Priority': content.priority || '',
        'Created': content.created_at || '',
      }));

      const timestamp = new Date().toISOString().split('T')[0];
      downloadCSV(exportData, `content-${timestamp}`);

      toast.success(`Exported ${exportData.length.toLocaleString()} content items`, { id: 'export' });
    } catch (error) {
      toast.error('Failed to export content', { id: 'export' });
      console.error('Export error:', error);
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
      header: 'Content',
      cell: ({ row }) => {
        const title = row.original.title || 'Untitled';
        const preview = row.original.transcript_raw
          ? row.original.transcript_raw.substring(0, 80) + (row.original.transcript_raw.length > 80 ? '...' : '')
          : row.original.description || 'No content';
        return (
          <div className="max-w-md">
            <div className="font-medium text-gray-900 truncate">
              {title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-2 mt-1">
              {preview}
            </div>
            {row.original.source_url && (
              <div className="text-xs text-gray-400 truncate mt-1">
                Source: {row.original.source_url}
              </div>
            )}
          </div>
        );
      },
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

      <Card className="p-6">
        {data && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Total Content: <span className="font-semibold">{data.total.toLocaleString()}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}

        {isLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
            pageSize={pageSize}
            pagination={{
              currentPage: page,
              pageSize,
              totalItems: data?.total || 0,
              onPageChange: handlePageChange,
            }}
            emptyState={
              <EmptyState
                title="No content found"
                description="Try adjusting your filters or create new content."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
