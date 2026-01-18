import React from 'react';
import { Lightbulb } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const RiskRecommendations = ({ recommendations = [] }) => {
  return (
    <Card 
      title="AI Recommendations" 
      className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700"
    >
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex gap-3">
              <Lightbulb className="text-yellow-500 shrink-0" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {rec.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {rec.description}
                </p>
                {rec.action && (
                  <Button size="sm" variant="secondary" className="mt-3">
                    {rec.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RiskRecommendations;
