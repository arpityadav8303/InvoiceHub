import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import Card from '../common/Card';

const RiskFactorsList = ({ factors = [] }) => {
  return (
    <Card title="Contributing Factors" className="h-full">
      <div className="space-y-4">
        {factors.map((factor, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {/* Icon based on impact */}
            <div className={`mt-0.5 p-1 rounded-full flex-shrink-0 
              ${factor.impact === 'negative' ? 'bg-red-100 text-red-600' : 
                factor.impact === 'positive' ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-600'}`}
            >
              {factor.impact === 'negative' ? <X size={14} /> : 
               factor.impact === 'positive' ? <Check size={14} /> : 
               <Minus size={14} />}
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {factor.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Category: {factor.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RiskFactorsList;
