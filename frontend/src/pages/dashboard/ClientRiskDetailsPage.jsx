import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

// Components
import RiskScoreCard from '../../components/risk/RiskScoreCard';
import RiskFactorsList from '../../components/risk/RiskFactorsList';
import RiskTrendChart from '../../components/risk/RiskTrendChart';
import RiskRecommendations from '../../components/risk/RiskRecommendations';
import RiskAlerts from '../../components/risk/RiskAlerts';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

const ClientRiskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // MOCK FETCH
  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setData({
        clientName: 'Tech Solutions Inc.',
        score: 78, // 0-100 (High Score = High Risk)
        level: 'High',
        lastUpdated: '2024-03-15',
        alerts: [
          'Client has 3 invoices overdue by 60+ days.',
          'Credit utilization spiked by 40% in last month.'
        ],
        factors: [
          { description: 'Consistent late payments (Avg 15 days late)', impact: 'negative', category: 'Payment History' },
          { description: 'Declining revenue reported in public filings', impact: 'negative', category: 'Financial Health' },
          { description: 'Long-term contract recently renewed', impact: 'positive', category: 'Relationship' },
        ],
        history: [
          { month: 'Oct', score: 45 },
          { month: 'Nov', score: 50 },
          { month: 'Dec', score: 55 },
          { month: 'Jan', score: 65 },
          { month: 'Feb', score: 72 },
          { month: 'Mar', score: 78 },
        ],
        recommendations: [
          { title: 'Request Advance Payment', description: 'Due to high risk, request 50% upfront for next project.', action: 'Update Payment Terms' },
          { title: 'Pause New Credit', description: 'Do not approve new credit limits until overdue invoices are cleared.', action: 'Freeze Credit' },
        ]
      });
      setLoading(false);
    }, 1200);
  }, [id]);

  const handleRefresh = () => {
    setLoading(true);
    showToast('Recalculating risk profile...', 'info');
    // Re-fetch logic would go here
    setTimeout(() => setLoading(false), 1500);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Risk Assessment
            </h1>
            <p className="text-gray-500">
              Analysis for <span className="font-semibold text-gray-900 dark:text-white">{data.clientName}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Last updated: {data.lastUpdated}</span>
            <Button variant="secondary" icon={RefreshCw} onClick={handleRefresh}>
                Recalculate
            </Button>
        </div>
      </div>

      {/* 2. Critical Alerts */}
      <div className="mb-8">
        <RiskAlerts alerts={data.alerts} />
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Score Card */}
        <div className="lg:col-span-1">
          <RiskScoreCard score={data.score} level={data.level} />
        </div>

        {/* Right: Trend Chart & Factors */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RiskTrendChart history={data.history} />
          <RiskFactorsList factors={data.factors} />
        </div>
      </div>

      {/* 4. Recommendations */}
      <div>
        <RiskRecommendations recommendations={data.recommendations} />
      </div>
    </div>
  );
};

export default ClientRiskDetailsPage;
