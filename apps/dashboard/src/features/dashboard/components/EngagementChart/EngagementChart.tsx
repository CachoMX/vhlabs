import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface EngagementData {
  date: string;
  sent: number;
  responses: number;
  responseRate: number;
}

interface EngagementChartProps {
  data: EngagementData[];
  isLoading?: boolean;
}

export function EngagementChart({ data, isLoading }: EngagementChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxSent = Math.max(...data.map(d => d.sent), 1);
  const maxResponses = Math.max(...data.map(d => d.responses), 1);
  const avgResponseRate = data.reduce((sum, d) => sum + d.responseRate, 0) / data.length;

  // Calculate trend
  const recentRate = data.slice(-3).reduce((sum, d) => sum + d.responseRate, 0) / Math.min(3, data.length);
  const olderRate = data.slice(0, 3).reduce((sum, d) => sum + d.responseRate, 0) / Math.min(3, data.length);
  const trend = recentRate > olderRate ? 'up' : recentRate < olderRate ? 'down' : 'stable';
  const trendPercent = olderRate > 0 ? Math.abs(((recentRate - olderRate) / olderRate) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Engagement Trends</CardTitle>
            <Tooltip content="Daily breakdown of messages sent vs responses received from the distributions table. Trend compares average response rate of last 3 days vs first 3 days in selected period.">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-600" />}
            {trend === 'stable' && <Minus className="h-5 w-5 text-gray-600" />}
            <span className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'stable' ? 'Stable' : `${trendPercent.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Avg Response Rate */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
              Average Response Rate
              <Tooltip content={`Calculated as: (Total Responses / Total Sent) × 100 across ${data.length} day${data.length !== 1 ? 's' : ''} in selected period`}>
                <Info className="h-3.5 w-3.5 text-blue-500 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-blue-900 mt-1">{avgResponseRate.toFixed(1)}%</div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                  <span className="font-medium">{item.responseRate.toFixed(1)}% response</span>
                </div>
                <div className="flex gap-1 items-end h-12">
                  {/* Sent bar */}
                  <div className="flex-1 bg-blue-100 rounded-t relative group">
                    <div
                      className="bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(item.sent / maxSent) * 100}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Sent: {item.sent}
                      </div>
                    </div>
                  </div>
                  {/* Responses bar */}
                  <div className="flex-1 bg-green-100 rounded-t relative group">
                    <div
                      className="bg-green-500 rounded-t transition-all"
                      style={{ height: `${(item.responses / maxResponses) * 100}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Responses: {item.responses}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs text-gray-600">Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-600">Responses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
