import { useState } from 'react';
import { toast } from 'sonner';
import { useGetContent } from '../../api/get-content';
import { useGetContentHooks } from '../../api/get-content-hooks';
import { useGetContentDistributions } from '../../api/get-content-distributions';
import { useUpdateContent } from '../../api/update-content';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Select, type SelectOption, Spinner } from '@/components/ui';

interface ContentDetailProps {
  contentId: string;
}

const statusOptions: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'distributed', label: 'Distributed' },
  { value: 'archived', label: 'Archived' },
];

const priorityOptions: SelectOption[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function ContentDetail({ contentId }: ContentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    title: string;
    description: string;
    priority: string;
    status: string;
  } | null>(null);

  const { data: content, isLoading: contentLoading } = useGetContent(contentId);
  const { data: hooks, isLoading: hooksLoading } = useGetContentHooks(contentId);
  const { data: distributions = [], isLoading: loadingDistributions } = useGetContentDistributions(contentId);
  const updateContent = useUpdateContent();

  const handleEdit = () => {
    if (content) {
      setEditData({
        title: content.title || '',
        description: content.description || '',
        priority: content.priority,
        status: content.status,
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!editData || !content) return;

    toast.promise(
      updateContent.mutateAsync({
        id: contentId,
        data: {
          title: editData.title,
          description: editData.description,
          priority: editData.priority,
          status: editData.status,
        },
      }),
      {
        loading: 'Updating content...',
        success: () => {
          setIsEditing(false);
          setEditData(null);
          return 'Content updated successfully';
        },
        error: 'Failed to update content. Please try again.',
      }
    );
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

  const getDistributionStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'success';
      case 'pending':
      case 'queued':
        return 'warning';
      case 'failed':
      case 'bounced':
        return 'error';
      default:
        return 'default';
    }
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Content not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Metadata Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Details</CardTitle>
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing && editData ? (
            <div className="space-y-4">
              <Input
                label="Title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              <Input
                label="Description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <Select
                label="Priority"
                options={priorityOptions}
                value={editData.priority}
                onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSaveEdit}
                  isLoading={updateContent.isPending}
                >
                  Save
                </Button>
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="mt-1 text-base text-gray-900">{content.title || 'Untitled'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-base text-gray-900">{content.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(content.status)}>{content.status}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <Badge variant={content.priority === 'high' ? 'error' : content.priority === 'medium' ? 'warning' : 'default'}>
                      {content.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="mt-1 text-base text-gray-900">
                  {content.source_type || 'Unknown'}
                  {content.source_url && (
                    <a
                      href={content.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      View Source
                    </a>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Audiences</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {content.audiences.map((audience) => (
                    <Badge key={audience} variant="info" size="sm">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Score</label>
                <p className="mt-1 text-base font-medium text-gray-900">{content.score.toFixed(1)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(content.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(content.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hooks Card */}
      <Card>
        <CardHeader>
          <CardTitle>Hooks ({hooks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {hooksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : hooks && hooks.length > 0 ? (
            <div className="space-y-3">
              {hooks.map((hook) => (
                <div key={hook.id} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900">{hook.text}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    {hook.hook_type && (
                      <span className="capitalize">{hook.hook_type}</span>
                    )}
                    {hook.used_count > 0 && (
                      <span>Used {hook.used_count} times</span>
                    )}
                    {hook.engagement_score !== null && (
                      <span>Engagement: {hook.engagement_score.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hooks found</p>
          )}
        </CardContent>
      </Card>

      {/* Distribution History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution History ({distributions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDistributions ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : distributions.length > 0 ? (
            <div className="space-y-3">
              {distributions.map((dist) => (
                <div key={dist.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" size="sm">
                        {dist.channel}
                      </Badge>
                      <Badge variant={getDistributionStatusVariant(dist.status)} size="sm">
                        {dist.status}
                      </Badge>
                    </div>
                    {dist.sent_at && (
                      <span className="text-sm text-gray-500">
                        {new Date(dist.sent_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {dist.subject && (
                    <p className="text-sm font-medium text-gray-900 mb-1">{dist.subject}</p>
                  )}
                  {dist.message_content && (
                    <p className="text-sm text-gray-600 line-clamp-2">{dist.message_content}</p>
                  )}
                  {dist.response_received && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-green-700">
                        Response received
                        {dist.response_at && ` on ${new Date(dist.response_at).toLocaleString()}`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No distributions found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
