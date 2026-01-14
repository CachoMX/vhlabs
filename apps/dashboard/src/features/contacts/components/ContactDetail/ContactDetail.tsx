import { Modal, Spinner, Badge } from '@/components/ui';
import { useGetContact } from '../../api/get-contact';

interface ContactDetailProps {
  contactId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDetail({ contactId, isOpen, onClose }: ContactDetailProps) {
  const { data, isLoading, error } = useGetContact(contactId);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Details"
      size="xl"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="text-red-600 py-4">
          Error loading contact details: {error.message}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm text-gray-900">
                  {data.contact.first_name || ''} {data.contact.last_name || ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{data.contact.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{data.contact.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">GHL ID</label>
                <p className="text-sm text-gray-900 font-mono">{data.contact.ghl_id}</p>
              </div>
            </div>
          </div>

          {/* Segment & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Segment</label>
              <p className="text-sm text-gray-900 mt-1">{data.contact.segment || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Investor Status</label>
              <p className="text-sm text-gray-900 mt-1">{data.contact.investor_status || 'N/A'}</p>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Score</label>
                <p className="text-2xl font-bold text-gray-900">{data.contact.score}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Touchpoints</label>
                <p className="text-2xl font-bold text-gray-900">{data.contact.touchpoint_count}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Responses</label>
                <p className="text-2xl font-bold text-gray-900">{data.contact.response_count}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Response Rate</label>
                <p className="text-2xl font-bold text-gray-900">
                  {data.contact.touchpoint_count > 0
                    ? `${Math.round((data.contact.response_count / data.contact.touchpoint_count) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Last Touchpoint</label>
                <p className="text-sm text-gray-900">
                  {data.contact.last_touchpoint_at
                    ? new Date(data.contact.last_touchpoint_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Response</label>
                <p className="text-sm text-gray-900">
                  {data.contact.last_response_at
                    ? new Date(data.contact.last_response_at).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {data.contact.tags && data.contact.tags.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.contact.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Distributions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Distributions ({data.distributions.length})
            </h3>
            {data.distributions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.distributions.map((dist) => (
                  <div key={dist.id} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={dist.status === 'sent' ? 'success' : 'secondary'}>
                            {dist.channel}
                          </Badge>
                          <span className="text-xs text-gray-500">{dist.message_type}</span>
                        </div>
                        {dist.subject && (
                          <p className="text-sm font-medium text-gray-900 mb-1">{dist.subject}</p>
                        )}
                        {dist.message_content && (
                          <p className="text-xs text-gray-600 line-clamp-2">{dist.message_content}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span>Sent: {dist.sent_at ? new Date(dist.sent_at).toLocaleString() : 'Pending'}</span>
                          {dist.opened_at && <span>Opened: {new Date(dist.opened_at).toLocaleString()}</span>}
                          {dist.response_received && <Badge variant="success">Responded</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No distributions found for this contact.</p>
            )}
          </div>

          {/* Sync Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Sync Status</label>
                <p className="text-sm text-gray-900">{data.contact.sync_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Synced</label>
                <p className="text-sm text-gray-900">
                  {new Date(data.contact.last_synced_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(data.contact.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
