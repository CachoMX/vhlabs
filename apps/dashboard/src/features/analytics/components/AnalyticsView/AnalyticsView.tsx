import { Tabs } from '@/components/ui';
import { EventsTable } from '../EventsTable/EventsTable';
import { WorkflowsTable } from '../WorkflowsTable/WorkflowsTable';

export function AnalyticsView() {
  const tabs = [
    {
      id: 'events',
      label: 'Event Log',
      content: <EventsTable />,
    },
    {
      id: 'workflows',
      label: 'Workflow Status',
      content: <WorkflowsTable />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">
          Monitor system events and workflow execution logs
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab="events" />
    </div>
  );
}
