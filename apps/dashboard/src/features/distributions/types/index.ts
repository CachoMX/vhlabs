
export interface DistributionFilters {
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DistributionPerformance {
  channel: string;
  message_type: string | null;
  total_sent: number | null;
  opened: number | null;
  clicked: number | null;
  responded: number | null;
  open_rate: number | null;
  click_rate: number | null;
  response_rate: number | null;
}
