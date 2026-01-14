import React from 'react';
import { MetricCard } from '@/components/ui';
import type { DashboardKPIs } from '../../types';

interface KPIGridProps {
  kpis: DashboardKPIs;
  isLoading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ kpis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="Total Content"
        value={kpis.totalContent}
        description="Content items in library"
      />
      <MetricCard
        label="Distributions Today"
        value={kpis.distributionsToday}
        description="Messages sent today"
      />
      <MetricCard
        label="Open Rate"
        value={`${kpis.openRate}%`}
        description="Average across channels"
      />
      <MetricCard
        label="Response Rate"
        value={`${kpis.responseRate}%`}
        description="Average across channels"
      />
    </div>
  );
};

KPIGrid.displayName = 'KPIGrid';
