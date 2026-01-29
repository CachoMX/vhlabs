import React from 'react';
import { Card } from '@/components/ui';
import { formatRelativeTime } from '@/utils/format';
import type { SystemHealthData } from '../../api/get-system-health';

interface SystemHealthProps {
  data: SystemHealthData;
  isLoading?: boolean;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const { errorLogs, errorCount, latestErrorTime } = data;

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        {errorCount > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-96">
        {errorCount === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600">All systems operational</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              Latest error: {latestErrorTime ? formatRelativeTime(latestErrorTime) : 'N/A'}
            </div>
            <div className="space-y-3">
              {errorLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-red-200 rounded-lg p-3 bg-red-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.workflow_name || 'Unknown Workflow'}
                      </p>
                      {log.error_data && typeof log.error_data === 'object' && 'message' in log.error_data && (
                        <p className="text-xs text-red-600 mt-1">
                          {String(log.error_data.message)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                  {log.execution_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {log.execution_id}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

SystemHealth.displayName = 'SystemHealth';
