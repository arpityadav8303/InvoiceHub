import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';

const RiskScoreCard = ({ score, level }) => {
  // Determine color theme based on risk level
  const getTheme = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': 
        return { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200', icon: ShieldCheck };
      case 'medium': 
        return { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200', icon: Shield };
      case 'high': 
      case 'critical':
        return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200', icon: ShieldAlert };
      default: 
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: Shield };
    }
  };

  const theme = getTheme(level);
  const Icon = theme.icon;

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className={`p-6 rounded-full ${theme.bg} ${theme.color} mb-4 relative`}>
        <Icon size={48} strokeWidth={1.5} />
        {/* Score Badge */}
        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold px-2 py-1 rounded-full shadow border border-gray-100 dark:border-gray-700">
          {score}/100
        </div>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {level} Risk
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
        Based on payment history, credit utilization, and market data.
      </p>

      {/* Visual Meter */}
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            level === 'Low' ? 'bg-green-500' : level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </Card>
  );
};

export default RiskScoreCard;
