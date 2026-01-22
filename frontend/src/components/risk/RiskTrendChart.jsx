import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';

const RiskTrendChart = ({ history }) => {
  const data = Array.isArray(history) ? history : [];

  return (
    <Card title="Risk Score Trend (6 Months)" className="h-[300px]">
      <div className="w-full" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RiskTrendChart;
