import { formatRelativeTime } from '@/utils/format';
import { Database } from '@/types/database.types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

interface ActivityFeedProps {
  events: AnalyticsEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">No recent activity</div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, idx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {idx !== events.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center ring-8 ring-white">
                    <EventIcon success={event.success} />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900">{event.event_type}</p>
                    {event.workflow_name && (
                      <p className="mt-0.5 text-xs text-gray-500">{event.workflow_name}</p>
                    )}
                    {!event.success && event.error_message && (
                      <p className="mt-0.5 text-xs text-red-600">{event.error_message}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-gray-500">
                    {formatRelativeTime(event.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventIcon({ success }: { success: boolean }) {
  return (
    <div className={`h-2 w-2 rounded-full ${success ? 'bg-primary-600' : 'bg-red-600'}`} />
  );
}
