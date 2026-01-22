import React, { useState, useEffect, useCallback } from 'react';
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
import { getClientRiskAssessment } from '../../services/clientService';

const ClientRiskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchRiskData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClientRiskAssessment(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      showToast(error.message || 'Failed to load risk assessment', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const handleRefresh = () => {
    fetchRiskData();
    showToast('Recalculating risk profile...', 'info');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!data) return <div className="p-8 text-center">Risk assessment not found</div>;

  // Transform backend factors object to array for RiskFactorsList if needed, 
  // or ensure RiskFactorsList can handle the object structure.
  // Based on ClientDetailsPage, RiskFactorsList seems to expect an array.
  // Let's create an adapter here similar to what we might need.
  const riskFactorsArray = [
    { description: 'Payment Reliability', impact: data.factors.paymentReliabilityScore.impact === 'High' ? 'positive' : 'negative', category: 'Score', ...data.factors.paymentReliabilityScore },
    { description: `Average Days Overdue: ${data.factors.averageDaysOverdue.days}`, impact: data.factors.averageDaysOverdue.days > 0 ? 'negative' : 'positive', category: 'Payment', ...data.factors.averageDaysOverdue },
    { description: `Recent Late Payments: ${data.factors.recentLatePayments.count}`, impact: data.factors.recentLatePayments.count > 0 ? 'negative' : 'positive', category: 'History', ...data.factors.recentLatePayments },
    { description: `Payment Velocity: ${data.factors.paymentVelocity.velocity}`, impact: data.factors.paymentVelocity.status === 'Acceptable' ? 'positive' : 'negative', category: 'Trend', ...data.factors.paymentVelocity }
  ];

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
          <span className="text-xs text-gray-500">Last updated: {new Date(data.riskSummary.lastAssessmentDate).toLocaleDateString()}</span>
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
          <RiskScoreCard score={data.riskSummary.riskScore} level={data.riskSummary.riskLevel} />
        </div>

        {/* Right: Trend Chart & Factors */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RiskTrendChart history={data.trendAnalysis.recentPerformance} /> {/* Check API mapping */}
          <RiskFactorsList factors={riskFactorsArray} />
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
