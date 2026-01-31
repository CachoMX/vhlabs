import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { ActivityFeed } from '@/components/ActivityFeed';
import { KPIGrid } from '../KPIGrid/KPIGrid';
import { SystemHealth } from '../SystemHealth/SystemHealth';
import { DashboardFilters } from '../DashboardFilters/DashboardFilters';
import { EngagementChart } from '../EngagementChart/EngagementChart';
import { ContactBreakdown } from '../ContactBreakdown/ContactBreakdown';
import { useGetKPIs } from '../../api/get-kpis';
import { useGetRecentActivity } from '../../api/get-recent-activity';
import { useGetSystemHealth } from '../../api/get-system-health';
import { useGetEngagementTrends } from '../../api/get-engagement-trends';
import { useGetContactBreakdown } from '../../api/get-contact-breakdown';
import type { DashboardFilters as DashboardFiltersType } from '../../types';

function getDefaultFilters(): DashboardFiltersType {
  const now = new Date();
  const last7Days = new Date(now);
  last7Days.setDate(last7Days.getDate() - 7);

  return {
    preset: 'last7days',
    startDate: last7Days.toISOString(),
    endDate: now.toISOString(),
  };
}

export const DashboardView: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultFilters());
  const { data: kpis, isLoading: isLoadingKPIs } = useGetKPIs(filters);
  const { data: activityEvents, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: systemHealth, isLoading: isLoadingHealth } = useGetSystemHealth();
  const { data: engagementTrends, isLoading: isLoadingTrends } = useGetEngagementTrends(filters);
  const { data: contactBreakdown, isLoading: isLoadingBreakdown } = useGetContactBreakdown();

  return (
    <div className="space-y-6">
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      <KPIGrid
        kpis={kpis || { totalContent: 0, emailsSent: 0, smsSent: 0, callsMade: 0, callsAnswered: 0, callAnswerRate: 0, openRate: 0, responseRate: 0 }}
        isLoading={isLoadingKPIs}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart
          data={engagementTrends || []}
          isLoading={isLoadingTrends}
        />

        <ContactBreakdown
          segments={contactBreakdown?.segments || []}
          statuses={contactBreakdown?.statuses || []}
          totalContacts={contactBreakdown?.totalContacts || 0}
          isLoading={isLoadingBreakdown}
        />
      </div>

      {/* Activity & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="flex-1 overflow-y-auto max-h-96">
            {isLoadingActivity ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : (
              <ActivityFeed events={activityEvents || []} />
            )}
          </div>
        </Card>

        <SystemHealth
          data={systemHealth || { errorLogs: [], errorCount: 0, latestErrorTime: null }}
          isLoading={isLoadingHealth}
        />
      </div>
    </div>
  );
};

DashboardView.displayName = 'DashboardView';
