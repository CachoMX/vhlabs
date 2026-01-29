import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { ActivityFeed } from '@/components/ActivityFeed';
import { KPIGrid } from '../KPIGrid/KPIGrid';
import { SystemHealth } from '../SystemHealth/SystemHealth';
import { DashboardFilters } from '../DashboardFilters/DashboardFilters';
import { useGetKPIs } from '../../api/get-kpis';
import { useGetRecentActivity } from '../../api/get-recent-activity';
import { useGetSystemHealth } from '../../api/get-system-health';
import type { DashboardFilters as DashboardFiltersType } from '../../types';

function getDefaultFilters(): DashboardFiltersType {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    preset: 'today',
    startDate: today.toISOString(),
    endDate: endOfDay.toISOString(),
  };
}

export const DashboardView: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFiltersType>(getDefaultFilters());
  const { data: kpis, isLoading: isLoadingKPIs } = useGetKPIs(filters);
  const { data: activityEvents, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: systemHealth, isLoading: isLoadingHealth } = useGetSystemHealth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your investor engagement system
        </p>
      </div>

      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      <KPIGrid
        kpis={kpis || { totalContent: 0, emailsSent: 0, smsSent: 0, openRate: 0, responseRate: 0 }}
        isLoading={isLoadingKPIs}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {isLoadingActivity ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          ) : (
            <ActivityFeed events={activityEvents || []} />
          )}
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
