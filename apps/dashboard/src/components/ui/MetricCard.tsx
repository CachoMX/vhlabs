import React from 'react';
import { cn } from '@/utils/cn';
import Card from './Card';

export interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  trend,
  description,
  className,
}) => {
  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {icon && (
              <div className="flex-shrink-0 text-gray-500">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-gray-600">{label}</p>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          {(trend || description) && (
            <div className="mt-2 flex items-center space-x-2">
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center text-sm font-medium',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? (
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className="text-sm text-gray-500">{description}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

MetricCard.displayName = 'MetricCard';

export default MetricCard;
