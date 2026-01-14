import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DistributionPerformance } from '../../types';

interface ChannelChartProps {
  data: DistributionPerformance[];
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    channel: item.channel,
    sent: item.total_sent || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
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
