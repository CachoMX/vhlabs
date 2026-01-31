import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Database } from '@/types/database.types';

type AllDistribution = Database['public']['Views']['v_all_distributions']['Row'];

interface PerformanceChartProps {
  distributions: AllDistribution[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ distributions }) => {
  // Group distributions by date and calculate open rates
  const dateMap = new Map<string, { total: number; opened: number }>();

  distributions.forEach((dist) => {
    if (!dist.sent_at) return;

    const date = new Date(dist.sent_at).toISOString().split('T')[0];
    const existing = dateMap.get(date) || { total: 0, opened: 0 };

    dateMap.set(date, {
      total: existing.total + 1,
      opened: existing.opened + (dist.opened_at ? 1 : 0),
    });
  });

  // Convert to chart data and sort by date
  const chartData = Array.from(dateMap.entries())
    .map(([date, stats]) => ({
      date,
      openRate: stats.total > 0 ? (stats.opened / stats.total) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend />
        <Line type="monotone" dataKey="openRate" stroke="#10B981" name="Open Rate %" />
      </LineChart>
    </ResponsiveContainer>
  );
};

PerformanceChart.displayName = 'PerformanceChart';
