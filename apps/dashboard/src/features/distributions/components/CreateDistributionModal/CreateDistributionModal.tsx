import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Select, Badge } from '@/components/ui';
import { useGetContacts } from '@/features/contacts';
import { useCreateDistributions } from '../../api/create-distribution';
import type { Database } from '@/types/database.types';

type Content = Database['public']['Tables']['contents']['Row'];

interface CreateDistributionModalProps {
  content: Content;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateDistributionModal({ content, onClose, onSuccess }: CreateDistributionModalProps) {
  const [channel, setChannel] = useState<'email' | 'sms' | 'social'>('email');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Fetch ALL contacts (no segment filter) so user can select anyone
  const { data: contactsData } = useGetContacts({
    filters: selectedSegment === 'all' ? {} : { segment: selectedSegment },
    pageSize: 1000, // Get all contacts for selection
  });

  const createDistributions = useCreateDistributions();

  const channelOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'social', label: 'Social Media' },
  ];

  const segmentOptions = useMemo(() => {
    // Start with "All Contacts" option
    const options = [
      { value: 'all', label: 'All Contacts' }
    ];

    // Add content's target audiences
    content.audiences.forEach(audience => {
      options.push({
        value: audience,
        label: audience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
    });

    // Add common segments for flexibility
    const commonSegments = [
      'general_leads',
      'hot_lead',
      'active_investor',
      'jv_potential',
      'passive_investor'
    ];

    commonSegments.forEach(seg => {
      if (!content.audiences.includes(seg)) {
        options.push({
          value: seg,
          label: seg.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        });
      }
    });

    return options;
  }, [content.audiences]);

  const availableContacts = contactsData?.data || [];

  const handleToggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
    setSelectAll(newSelected.size === availableContacts.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(availableContacts.map(c => c.ghl_id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    if (selectedContactIds.size === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    try {
      await createDistributions.mutateAsync({
        content_id: content.id,
        ghl_contact_ids: Array.from(selectedContactIds),
        channel,
      });

      toast.success(`Distribution created for ${selectedContactIds.size} contacts`);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to create distribution');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Distribution</h2>
            <p className="text-sm text-gray-500 mt-1">
              Distribute content to contacts via {channel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Content Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
            <p className="text-sm text-gray-900">
              {content.title || content.description || 'No title'}
            </p>
            <div className="flex gap-2 mt-2">
              {content.audiences.map(audience => (
                <Badge key={audience} variant="secondary" size="sm">
                  {audience.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Distribution Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Channel"
              options={channelOptions}
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
            />
            <Select
              label="Segment"
              options={segmentOptions}
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
            />
          </div>

          {/* Contact Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Select Contacts ({selectedContactIds.size} selected)
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {availableContacts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No contacts found for this segment
                </div>
              ) : (
                <div className="divide-y">
                  {availableContacts.map(contact => (
                    <label
                      key={contact.ghl_id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContactIds.has(contact.ghl_id)}
                        onChange={() => handleToggleContact(contact.ghl_id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {contact.email || contact.phone}
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        Score: {contact.score}
                      </Badge>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={createDistributions.isPending}
            disabled={selectedContactIds.size === 0}
          >
            Create Distribution ({selectedContactIds.size} contacts)
          </Button>
        </div>
      </Card>
    </div>
  );
}
