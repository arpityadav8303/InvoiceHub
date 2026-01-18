import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const ClientGrowthChart = () => {
  const data = [
    { name: 'Sep', clients: 2 },
    { name: 'Oct', clients: 5 },
    { name: 'Nov', clients: 3 },
    { name: 'Dec', clients: 8 },
    { name: 'Jan', clients: 12 },
  ];

  return (
    <Card title="New Clients">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
