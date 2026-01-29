import { useState, useEffect, useMemo } from 'react';
import { useGetPrompt } from '../../api/get-prompt';
import { useUpdatePrompt } from '../../api/update-prompt';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input, Textarea, Select, type SelectOption, Spinner } from '@/components/ui';
// import type { Database } from '@/types/database.types';

// type Prompt = Database['public']['Tables']['prompts']['Row'];

interface PromptDetailProps {
  promptId: string;
}

const categoryOptions: SelectOption[] = [
  { value: '', label: 'No Category' },
  { value: 'content-generation', label: 'Content Generation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'summarization', label: 'Summarization' },
  { value: 'classification', label: 'Classification' },
  { value: 'extraction', label: 'Extraction' },
];

const systemOptions: SelectOption[] = [
  { value: 'system1', label: 'System 1' },
  { value: 'system2', label: 'System 2' },
  { value: 'system3', label: 'System 3' },
  { value: 'system4', label: 'System 4' },
];

export function PromptDetail({ promptId }: PromptDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<{
    name: string;
    description: string;
    category: string;
    content: string;
    system: string;
  } | null>(null);

  const { data, isLoading: promptLoading } = useGetPrompt(promptId);
  const updatePrompt = useUpdatePrompt();

  // Extract variables from content (text in braces like {variable})
  const extractVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const matches = content.matchAll(regex);
    const vars = new Set<string>();
    for (const match of matches) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  };

  const highlightedContent = useMemo(() => {
    if (!editData?.content) return '';

    // Replace {variable} with highlighted version
    return editData.content.replace(/\{([^}]+)\}/g, (match) => {
      return `<span class="bg-yellow-100 text-yellow-900 px-1 rounded font-medium">${match}</span>`;
    });
  }, [editData?.content]);

  useEffect(() => {
    if (data?.prompt && !editData) {
      setEditData({
        name: data.prompt.name,
        description: data.prompt.description || '',
        category: data.prompt.category || '',
        content: data.prompt.content,
        system: data.prompt.system,
      });
    }
  }, [data, editData]);

  const handleEdit = () => {
    if (data?.prompt) {
      setEditData({
        name: data.prompt.name,
        description: data.prompt.description || '',
        category: data.prompt.category || '',
        content: data.prompt.content,
        system: data.prompt.system,
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data?.prompt) {
      setEditData({
        name: data.prompt.name,
        description: data.prompt.description || '',
        category: data.prompt.category || '',
        content: data.prompt.content,
        system: data.prompt.system,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editData || !data?.prompt) return;

    const variables = extractVariables(editData.content);

    try {
      await updatePrompt.mutateAsync({
        promptId: data.prompt.prompt_id,
        data: {
          name: editData.name,
          description: editData.description || null,
          category: editData.category || null,
          content: editData.content,
          variables,
          system: editData.system,
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update prompt:', err);
      alert('Failed to update prompt. Please try again.');
    }
  };

  if (promptLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!data?.prompt) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          Prompt not found
        </div>
      </div>
    );
  }

  const currentVariables = editData ? extractVariables(editData.content) : [];

  return (
    <div className="space-y-6">
      {/* Prompt Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prompt Details</CardTitle>
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
                label="Name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required
              />
              <Input
                label="Description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <Select
                label="System"
                options={systemOptions}
                value={editData.system}
                onChange={(e) => setEditData({ ...editData, system: e.target.value })}
                required
              />
              <Select
                label="Category"
                options={categoryOptions}
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              />
              <div>
                <Textarea
                  label="Content"
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  rows={12}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Use curly braces to define variables, e.g., {'{variable_name}'}
                </p>
              </div>

              {/* Variables Preview */}
              {currentVariables.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Detected Variables</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentVariables.map((variable) => (
                      <Badge key={variable} variant="warning" size="sm">
                        {'{' + variable + '}'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div>
                <label className="text-sm font-medium text-gray-700">Preview with Highlighted Variables</label>
                <div
                  className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: highlightedContent }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSaveEdit}
                  isLoading={updatePrompt.isPending}
                >
                  Save New Version
                </Button>
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-base text-gray-900">{data.prompt.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-base text-gray-900">{data.prompt.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">System</label>
                  <div className="mt-1">
                    <Badge variant="info">{data.prompt.system}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1">
                    <span className="text-base text-gray-900 capitalize">
                      {data.prompt.category || 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Version</label>
                  <div className="mt-1">
                    <Badge variant="default">v{data.prompt.version}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={data.prompt.is_active ? 'success' : 'default'}>
                    {data.prompt.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Variables</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.prompt.variables && data.prompt.variables.length > 0 ? (
                    data.prompt.variables.map((variable) => (
                      <Badge key={variable} variant="warning" size="sm">
                        {'{' + variable + '}'}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No variables</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                    {data.prompt.content}
                  </pre>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(data.prompt.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated</label>
                  <p className="mt-1 text-base text-gray-900">
                    {new Date(data.prompt.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Version History ({data.versions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.versions.length > 0 ? (
            <div className="space-y-3">
              {data.versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 ${
                    version.id === data.prompt.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">
                        v{version.version}
                      </Badge>
                      {version.is_active && (
                        <Badge variant="success" size="sm">
                          Active
                        </Badge>
                      )}
                      {version.id === data.prompt.id && (
                        <Badge variant="info" size="sm">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                  {version.description && (
                    <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                  )}
                  <div className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-100">
                    <div className="line-clamp-3 whitespace-pre-wrap">
                      {version.content}
                    </div>
                  </div>
                  {version.variables && version.variables.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {version.variables.map((variable) => (
                        <Badge key={variable} variant="warning" size="sm">
                          {'{' + variable + '}'}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No version history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
