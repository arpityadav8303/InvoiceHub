import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';

const PaymentStatusChart = ({ stats }) => {
  const data = [
    { name: 'Paid', value: stats?.paid || 12, color: '#16a34a' },     // Green-600
    { name: 'Pending', value: stats?.pending || 5, color: '#ca8a04' }, // Yellow-600
    { name: 'Overdue', value: stats?.overdue || 3, color: '#dc2626' }, // Red-600
  ];

  return (
    <Card title="Invoice Status">
      <div className="w-full relative" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, _) => <span className="text-sm font-medium text-gray-600 ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
          <p className="text-xs text-gray-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-gray-900">20</p>
        </div>
      </div>
    </Card>
  );
};

export default PaymentStatusChart;
