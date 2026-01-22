import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const ClientGrowthChart = ({ data }) => {
  const chartData = data || [];

  return (
    <Card title="New Clients">
      <div className="w-full" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none' }}
            />
            <Bar
              dataKey="clients"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ClientGrowthChart;
