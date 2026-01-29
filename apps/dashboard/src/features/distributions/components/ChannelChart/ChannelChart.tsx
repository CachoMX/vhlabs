import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Database } from '@/types/database.types';

type Distribution = Database['public']['Tables']['distributions']['Row'];

interface ChannelChartProps {
  distributions: Distribution[];
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ distributions }) => {
  // Group distributions by channel and count
  const channelMap = new Map<string, number>();

  distributions.forEach((dist) => {
    const count = channelMap.get(dist.channel) || 0;
    channelMap.set(dist.channel, count + 1);
  });

  // Convert to chart data
  const groupedData = Array.from(channelMap.entries()).map(([channel, sent]) => ({
    channel,
    sent,
  }));

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
