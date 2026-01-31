export interface DashboardKPIs {
  totalContent: number;
  emailsSent: number;
  smsSent: number;
  callsMade: number;
  callsAnswered: number;
  callAnswerRate: number;
  openRate: number;
  responseRate: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}
