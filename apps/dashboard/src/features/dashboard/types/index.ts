export interface DashboardKPIs {
  totalContent: number;
  distributionsToday: number;
  openRate: number;
  responseRate: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}
