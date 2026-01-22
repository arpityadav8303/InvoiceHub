import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Card from '../common/Card';

const RiskAlerts = ({ alerts = [] }) => {
  if (!alerts.length) return null;

  return (
    <Card className="border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
        <h3 className="font-bold text-red-900 dark:text-red-300">Critical Alerts</h3>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex gap-3 text-sm text-red-800 dark:text-red-200">
            <span className="font-bold">•</span>
            <div>
              <span className="font-semibold">{alert.title}: </span>
              <span>{alert.message}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RiskAlerts;
