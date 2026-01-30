import { EventsTable } from '../EventsTable/EventsTable';

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor system events and workflow execution
        </p>
      </div>

      <EventsTable />
    </div>
  );
}
