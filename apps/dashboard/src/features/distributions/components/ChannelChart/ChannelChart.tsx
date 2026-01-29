import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistributionPerformance } from '../../types';

interface ChannelChartProps {
  data: DistributionPerformance[];
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ data }) => {
  // Group by channel only (combine all message_types per channel)
  const groupedData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.channel === item.channel);
    if (existing) {
      existing.sent += item.total_sent || 0;
    } else {
      acc.push({
        channel: item.channel,
        sent: item.total_sent || 0,
      });
    }
    return acc;
  }, [] as { channel: string; sent: number }[]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="channel" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sent" fill="#3B82F6" name="Sends" />
      </BarChart>
    </ResponsiveContainer>
  );
};

ChannelChart.displayName = 'ChannelChart';
