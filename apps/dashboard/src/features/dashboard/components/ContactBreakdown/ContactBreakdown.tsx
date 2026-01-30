import { Card, CardHeader, CardTitle, CardContent, Tooltip } from '@/components/ui';
import { Users, Info } from 'lucide-react';

interface SegmentData {
  segment: string;
  count: number;
  percentage: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface ContactBreakdownProps {
  segments: SegmentData[];
  statuses: StatusData[];
  totalContacts: number;
  isLoading?: boolean;
}

const SEGMENT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
];

const STATUS_COLORS: Record<string, string> = {
  'hot_lead': 'bg-red-500',
  'active_investor': 'bg-green-500',
  'jv_potential': 'bg-blue-500',
  'passive_investor': 'bg-yellow-500',
  'objection_holder': 'bg-orange-500',
  'tire_kicker': 'bg-gray-400',
  'dormant': 'bg-gray-300',
  'cold': 'bg-gray-500',
};

export function ContactBreakdown({ segments, statuses, totalContacts, isLoading }: ContactBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Contact Breakdown</CardTitle>
            <Tooltip content="Distribution of all contacts in contacts_sync table by segment and investor status. Numbers are live counts from the database.">
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span className="font-semibold">{totalContacts.toLocaleString()}</span> total
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Segments - Donut Chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-700">By Segment</h3>
              <Tooltip content="Contacts grouped by their segment field. 'unassigned' means segment is NULL or empty in the database.">
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>

            {/* Visual donut representation */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              {segments.map((seg, index) => {
                const totalPercentage = segments.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
                const dashArray = `${seg.percentage} ${100 - seg.percentage}`;
                const rotation = (totalPercentage * 3.6) - 90; // Convert to degrees and start from top

                return (
                  <svg
                    key={seg.segment}
                    className="absolute inset-0"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke={SEGMENT_COLORS[index % SEGMENT_COLORS.length].replace('bg-', '')}
                      strokeWidth="3.2"
                      strokeDasharray={dashArray}
                      strokeDashoffset="0"
                      transform={`rotate(${rotation} 18 18)`}
                      className={`${SEGMENT_COLORS[index % SEGMENT_COLORS.length].replace('bg-', 'stroke-')}`}
                    />
                  </svg>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{segments.length}</div>
                  <div className="text-xs text-gray-500">Segments</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {segments.map((seg, index) => (
                <div key={seg.segment} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`} />
                    <span className="text-sm text-gray-700 capitalize">{seg.segment.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{seg.count.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">({seg.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Statuses */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-700">Top Investor Statuses</h3>
              <Tooltip content={`Shows top 5 investor statuses by contact count out of ${totalContacts.toLocaleString()} total contacts. 'unassigned' means investor_status is NULL or empty. Numbers represent actual contacts, not percentages.`}>
                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-2">
              {statuses.slice(0, 5).map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status.status] || 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-700 capitalize">{status.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${STATUS_COLORS[status.status] || 'bg-gray-400'}`}
                        style={{ width: `${(status.count / totalContacts) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{status.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
