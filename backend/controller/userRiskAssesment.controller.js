// ==================== CONTROLLER ====================
// backend/controller/dashboard.controller.js (Add this function)

import Client from '../models/client.model.js';
import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';
import mongoose from 'mongoose';

/**
 * Get Detailed Risk Assessment for a Client
 * GET /api/dashboard/clients/:id/risk-assessment
 * 
 * Returns comprehensive risk analysis including:
 *   - Risk score (0-100)
 *   - Risk level (LOW/MEDIUM/HIGH)
 *   - Contributing factors
 *   - Payment trend analysis
 *   - Recommendations
 *   - Predicted payment date
 *   - Alerts
 */
export const getClientRiskAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // ========== VALIDATE CLIENT EXISTS & BELONGS TO USER ==========
    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this client'
      });
    }

    // ========== FETCH CLIENT INVOICES & PAYMENTS ==========
    const invoices = await Invoice.find({ clientId: id })
      .sort({ invoiceDate: -1 })
      .lean();

    const payments = await Payment.find({ clientId: id })
      .sort({ paymentDate: -1 })
      .lean();

    // ========== CALCULATE RISK FACTORS ==========
    const factors = calculateRiskFactors(client, invoices, payments);

    // ========== CALCULATE RISK SCORE & LEVEL ==========
    const { riskScore, riskLevel } = calculateRiskScore(factors);

    // ========== ANALYZE PAYMENT TREND ==========
    const paymentTrend = analyzePaymentTrend(client, invoices, payments);

    // ========== GENERATE RECOMMENDATIONS ==========
    const recommendations = generateRecommendations(factors, riskLevel, paymentTrend);

    // ========== PREDICT NEXT PAYMENT DATE ==========
    const predictedPaymentDate = predictNextPaymentDate(invoices, payments, factors.averageDaysToPayment);

    // ========== IDENTIFY ALERTS ==========
    const alerts = identifyAlerts(factors, client, invoices);

    // ========== CALCULATE ADDITIONAL METRICS ==========
    const metrics = calculateAdditionalMetrics(invoices, payments);

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Risk assessment completed',
      data: {
        clientId: client._id,
        clientName: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        companyName: client.companyName,
        
        // RISK SUMMARY
        riskSummary: {
          riskScore: parseFloat(riskScore.toFixed(2)),
          riskLevel,
          riskTrend: paymentTrend.trend,
          trendDescription: paymentTrend.trendDescription,
          lastAssessmentDate: new Date().toISOString(),
          nextReviewDate: getNextReviewDate(riskLevel)
        },

        // RISK FACTORS
        factors: {
          paymentReliabilityScore: {
            score: client.paymentStats.paymentReliabilityScore,
            weight: 30,
            impact: 'High',
            status: client.paymentStats.paymentReliabilityScore >= 80 ? 'Good' : 'Needs Attention'
          },
          averageDaysOverdue: {
            days: parseFloat(factors.averageDaysOverdue.toFixed(2)),
            weight: 25,
            impact: 'High',
            status: factors.averageDaysOverdue > 30 ? 'Critical' : factors.averageDaysOverdue > 14 ? 'Warning' : 'Good'
          },
          recentLatePayments: {
            count: factors.recentLatePayments,
            weight: 20,
            impact: 'High',
            percentage: metrics.latePaymentPercentage,
            status: factors.recentLatePayments > 2 ? 'Critical' : factors.recentLatePayments > 0 ? 'Warning' : 'Good'
          },
          paymentVelocity: {
            velocity: factors.paymentVelocity,
            weight: 15,
            impact: 'Medium',
            status: factors.paymentVelocity === 'slow' ? 'Concerning' : 'Acceptable'
          },
          invoicedAmount: {
            amount: parseFloat(factors.invoicedAmount.toFixed(2)),
            weight: 5,
            impact: 'Low'
          },
          paidAmount: {
            amount: parseFloat(factors.paidAmount.toFixed(2)),
            weight: 5,
            impact: 'Low'
          },
          consistencyTrend: {
            trend: paymentTrend.trend,
            direction: paymentTrend.direction,
            weight: 10,
            impact: 'Medium',
            status: paymentTrend.trend === 'improving' ? 'Good' : paymentTrend.trend === 'stable' ? 'Fair' : 'Concerning'
          }
        },

        // DETAILED PAYMENT ANALYSIS
        paymentAnalysis: {
          totalInvoices: metrics.totalInvoices,
          paidInvoices: metrics.paidInvoices,
          partiallyPaidInvoices: metrics.partiallyPaidInvoices,
          unpaidInvoices: metrics.unpaidInvoices,
          overdueInvoices: metrics.overdueInvoices,
          
          paymentMetrics: {
            onTimePayments: client.paymentStats.onTimePayments,
            latePayments: client.paymentStats.latePayments,
            onTimePercentage: metrics.onTimePaymentPercentage,
            latePercentage: metrics.latePaymentPercentage,
            averageDaysToPayment: parseFloat(client.paymentStats.averageDaysToPayment.toFixed(2)),
            medianPaymentDays: calculateMedianPaymentDays(invoices, payments)
          },

          financialMetrics: {
            totalInvoiced: parseFloat(factors.invoicedAmount.toFixed(2)),
            totalPaid: parseFloat(factors.paidAmount.toFixed(2)),
            totalOutstanding: parseFloat((factors.invoicedAmount - factors.paidAmount).toFixed(2)),
            totalOverdue: parseFloat(metrics.overdueAmount.toFixed(2)),
            collectionRate: parseFloat(metrics.collectionRate.toFixed(2)),
            averageInvoiceValue: parseFloat(metrics.averageInvoiceValue.toFixed(2))
          }
        },

        // PAYMENT HISTORY (Last 6 months)
        paymentHistory: {
          recentPayments: payments.slice(0, 10).map(payment => ({
            amount: parseFloat((payment.amount || 0).toFixed(2)),
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            invoiceId: payment.invoiceId,
            transactionId: payment.transactionId
          })),
          paymentFrequency: calculatePaymentFrequency(payments),
          averagePaymentAmount: parseFloat(metrics.averagePaymentAmount.toFixed(2))
        },

        // CURRENT STATUS
        currentStatus: {
          activeDueInvoices: metrics.activeDueInvoices,
          overdueInvoices: metrics.overdueInvoices,
          overdueAmount: parseFloat(metrics.overdueAmount.toFixed(2)),
          oldestOverdueDate: metrics.oldestOverdueDate,
          daysOldestOverdue: metrics.daysOldestOverdue,
          nextDueDate: metrics.nextDueDate,
          daysUntilDue: metrics.daysUntilDue
        },

        // TREND ANALYSIS
        trendAnalysis: {
          paymentTrend: paymentTrend.trend,
          trendDescription: paymentTrend.trendDescription,
          trendDirection: paymentTrend.direction,
          recentPerformance: paymentTrend.recentPerformance,
          sixMonthPerformance: paymentTrend.sixMonthPerformance,
          improvementRate: parseFloat(paymentTrend.improvementRate.toFixed(2)),
          volatilityIndex: parseFloat(calculateVolatilityIndex(invoices, payments).toFixed(2))
        },

        // PREDICTIONS
        predictions: {
          predictedPaymentDate: predictedPaymentDate?.date || null,
          predictedDaysToPayment: predictedPaymentDate?.daysToPayment || null,
          paymentProbability: {
            onTime: calculatePaymentProbability(factors, 'on-time'),
            late: calculatePaymentProbability(factors, 'late'),
            veryLate: calculatePaymentProbability(factors, 'very-late')
          }
        },

        // RECOMMENDATIONS
        recommendations: recommendations.map(rec => ({
          priority: rec.priority,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          action: rec.action,
          expectedImpact: rec.expectedImpact,
          daysToImplement: rec.daysToImplement
        })),

        // ALERTS
        alerts: alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          actionRequired: alert.actionRequired,
          suggestedAction: alert.suggestedAction,
          createdAt: alert.createdAt
        })),

        // RISK HISTORY (for tracking changes)
        riskHistory: {
          previousRiskScore: client.riskScore || null,
          scoreChange: client.riskScore ? parseFloat((riskScore - client.riskScore).toFixed(2)) : 0,
          previousRiskLevel: client.riskLevel || null,
          levelChanged: (client.riskLevel || null) !== riskLevel,
          assessmentHistory: {
            totalAssessments: 1,
            lastUpdated: new Date().toISOString()
          }
        }
      }
    });
  } catch (error) {
    console.error('Client Risk Assessment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating risk assessment',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate risk factors
 */
function calculateRiskFactors(client, invoices, payments) {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Recent late payments (last 6 months)
  const recentLatePayments = invoices.filter(inv => {
    const invoiceDate = new Date(inv.invoiceDate);
    if (invoiceDate < sixMonthsAgo) return false;
    
    const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
    if (!payment) return inv.dueDate && new Date(inv.dueDate) < now;
    
    return new Date(payment.paymentDate) > new Date(inv.dueDate);
  }).length;

  // Calculate average days overdue
  let totalDaysOverdue = 0;
  let overdueCount = 0;

  invoices.forEach(inv => {
    if (inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid') {
      const daysOverdue = Math.ceil((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
      totalDaysOverdue += daysOverdue;
      overdueCount += 1;
    }
  });

  const averageDaysOverdue = overdueCount > 0 ? totalDaysOverdue / overdueCount : 0;

  // Calculate total amounts
  const invoicedAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = payments.reduce((sum, pay) => sum + pay.amount, 0);

  // Determine payment velocity
  const paymentVelocity = determinePaymentVelocity(client.paymentStats.averageDaysToPayment);

  return {
    recentLatePayments,
    averageDaysOverdue,
    invoicedAmount,
    paidAmount,
    paymentVelocity
  };
}

/**
 * Calculate risk score (0-100)
 */
function calculateRiskScore(factors) {
  let score = 0;

  // Payment reliability score (0-30 points)
  const clientPaymentScore = factors.paymentReliabilityScore || 100;
  score += (100 - clientPaymentScore) * 0.3;

  // Average days overdue (0-25 points)
  score += Math.min(25, (factors.averageDaysOverdue / 30) * 25);

  // Recent late payments (0-20 points)
  score += Math.min(20, factors.recentLatePayments * 5);

  // Payment velocity (0-15 points)
  if (factors.paymentVelocity === 'slow') {
    score += 15;
  } else if (factors.paymentVelocity === 'normal') {
    score += 5;
  }

  // Cap at 100
  score = Math.min(100, score);

  // Determine risk level
  let riskLevel = 'LOW';
  if (score >= 70) {
    riskLevel = 'HIGH';
  } else if (score >= 40) {
    riskLevel = 'MEDIUM';
  }

  return { riskScore: score, riskLevel };
}

/**
 * Analyze payment trend
 */
function analyzePaymentTrend(client, invoices, payments) {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get recent and older payments
  const recentPayments = payments.filter(p => new Date(p.paymentDate) >= threeMonthsAgo);
  const olderPayments = payments.filter(p => 
    new Date(p.paymentDate) >= sixMonthsAgo && 
    new Date(p.paymentDate) < threeMonthsAgo
  );

  // Calculate on-time percentage for each period
  const recentInvoices = invoices.filter(inv => new Date(inv.invoiceDate) >= threeMonthsAgo);
  const olderInvoices = invoices.filter(inv => 
    new Date(inv.invoiceDate) >= sixMonthsAgo && 
    new Date(inv.invoiceDate) < threeMonthsAgo
  );

  const recentOnTime = recentInvoices.filter(inv => {
    const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
    return payment && new Date(payment.paymentDate) <= new Date(inv.dueDate);
  }).length;

  const olderOnTime = olderInvoices.filter(inv => {
    const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
    return payment && new Date(payment.paymentDate) <= new Date(inv.dueDate);
  }).length;

  const recentPercentage = recentInvoices.length > 0 ? (recentOnTime / recentInvoices.length) * 100 : 0;
  const olderPercentage = olderInvoices.length > 0 ? (olderOnTime / olderInvoices.length) * 100 : 0;

  // Determine trend
  let trend = 'stable';
  let direction = 0;

  if (recentPercentage > olderPercentage + 10) {
    trend = 'improving';
    direction = 1;
  } else if (recentPercentage < olderPercentage - 10) {
    trend = 'declining';
    direction = -1;
  }

  const improvementRate = recentPercentage - olderPercentage;

  return {
    trend,
    direction,
    trendDescription: trend === 'improving' ? 'Payment performance is getting better' : 
                     trend === 'declining' ? 'Payment performance is getting worse' :
                     'Payment performance is stable',
    recentPerformance: parseFloat(recentPercentage.toFixed(2)),
    sixMonthPerformance: parseFloat(olderPercentage.toFixed(2)),
    improvementRate
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(factors, riskLevel, paymentTrend) {
  const recommendations = [];

  if (riskLevel === 'HIGH') {
    recommendations.push({
      priority: 'Critical',
      category: 'Payment Follow-up',
      title: 'Immediate Payment Review Required',
      description: 'This client has a high-risk profile. Immediate action needed to prevent further delays.',
      action: 'Contact client immediately to discuss payment arrangement',
      expectedImpact: 'Reduce payment delays by 50%',
      daysToImplement: 1
    });

    recommendations.push({
      priority: 'Critical',
      category: 'Credit Management',
      title: 'Consider Suspending Credit',
      description: 'Consider pausing credit terms until payment situation improves',
      action: 'Require advance payment or shorter payment terms',
      expectedImpact: 'Protect future cash flow',
      daysToImplement: 3
    });
  }

  if (factors.averageDaysOverdue > 30) {
    recommendations.push({
      priority: 'High',
      category: 'Debt Collection',
      title: 'Escalate Overdue Accounts',
      description: `Client has average ${factors.averageDaysOverdue.toFixed(0)} days overdue`,
      action: 'Consider professional collection agency or legal action',
      expectedImpact: 'Recover outstanding payments',
      daysToImplement: 7
    });
  }

  if (factors.paymentVelocity === 'slow') {
    recommendations.push({
      priority: 'Medium',
      category: 'Terms Management',
      title: 'Review Payment Terms',
      description: 'Client consistently pays slowly. Consider adjusting terms.',
      action: 'Offer incentive for early payment or reduce payment terms',
      expectedImpact: 'Improve cash flow timing',
      daysToImplement: 5
    });
  }

  if (paymentTrend.trend === 'improving') {
    recommendations.push({
      priority: 'Low',
      category: 'Relationship Building',
      title: 'Recognize Improvement',
      description: 'Client performance is improving. Build on this positive trend.',
      action: 'Send positive feedback and thank them for improvement',
      expectedImpact: 'Strengthen client relationship',
      daysToImplement: 2
    });
  }

  if (factors.recentLatePayments === 0 && factors.averageDaysOverdue === 0) {
    recommendations.push({
      priority: 'Low',
      category: 'Retention',
      title: 'Client in Good Standing',
      description: 'This is a reliable client with excellent payment history.',
      action: 'Consider for loyalty program or preferential terms',
      expectedImpact: 'Improve retention',
      daysToImplement: 10
    });
  }

  return recommendations;
}

/**
 * Predict next payment date
 */
function predictNextPaymentDate(invoices, payments, averageDaysToPayment) {
  // Find oldest unpaid invoice
  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && 
    (!payments.some(p => p.invoiceId.toString() === inv._id.toString()))
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (unpaidInvoices.length === 0) {
    return null;
  }

  const oldestUnpaid = unpaidInvoices[0];
  const predictedDate = new Date(oldestUnpaid.dueDate);
  predictedDate.setDate(predictedDate.getDate() + Math.round(averageDaysToPayment));

  const daysToPayment = Math.ceil((predictedDate - new Date()) / (1000 * 60 * 60 * 24));

  return {
    date: predictedDate.toISOString(),
    daysToPayment: Math.max(0, daysToPayment),
    based_on_invoice: oldestUnpaid.invoiceNumber
  };
}

/**
 * Identify alerts
 */
function identifyAlerts(factors, client, invoices) {
  const alerts = [];
  const now = new Date();

  // Alert 1: Overdue invoices
  const overdueInvoices = invoices.filter(inv => 
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  );

  if (overdueInvoices.length > 0) {
    const overdueAmount = overdueInvoices.reduce((sum, inv) => 
      sum + (inv.total - inv.paidAmount), 0
    );

    alerts.push({
      id: 'overdue-invoice',
      type: 'Overdue Invoice',
      severity: overdueAmount > 10000 ? 'Critical' : overdueAmount > 5000 ? 'High' : 'Medium',
      title: `${overdueInvoices.length} Overdue Invoice(s)`,
      message: `${overdueInvoices.length} invoice(s) totaling $${overdueAmount.toFixed(2)} are overdue`,
      actionRequired: true,
      suggestedAction: 'Send payment reminder or contact client',
      createdAt: new Date().toISOString()
    });
  }

  // Alert 2: High recent late payments
  if (factors.recentLatePayments > 2) {
    alerts.push({
      id: 'pattern-late-payment',
      type: 'Payment Pattern',
      severity: 'High',
      title: 'Consistent Late Payment Pattern',
      message: `Client has had ${factors.recentLatePayments} late payments recently`,
      actionRequired: true,
      suggestedAction: 'Review terms and consider requiring advance payment',
      createdAt: new Date().toISOString()
    });
  }

  // Alert 3: Average days overdue
  if (factors.averageDaysOverdue > 60) {
    alerts.push({
      id: 'high-overdue-days',
      type: 'Payment Delay',
      severity: 'Critical',
      title: 'Significant Payment Delays',
      message: `Average ${factors.averageDaysOverdue.toFixed(0)} days overdue across invoices`,
      actionRequired: true,
      suggestedAction: 'Escalate to collections or consider legal action',
      createdAt: new Date().toISOString()
    });
  }

  // Alert 4: Declining trend
  if (factors.consistencyTrend === 'declining') {
    alerts.push({
      id: 'declining-trend',
      type: 'Trend Alert',
      severity: 'Medium',
      title: 'Declining Payment Performance',
      message: 'Client\'s payment performance is getting worse over time',
      actionRequired: true,
      suggestedAction: 'Monitor closely and increase follow-up frequency',
      createdAt: new Date().toISOString()
    });
  }

  // Alert 5: No recent payment activity
  const lastPaymentDate = client.paymentStats.lastPaymentDate;
  if (lastPaymentDate) {
    const daysSincePayment = Math.floor((now - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24));
    if (daysSincePayment > 90) {
      alerts.push({
        id: 'no-recent-activity',
        type: 'Inactivity Alert',
        severity: 'Medium',
        title: 'No Recent Payment Activity',
        message: `No payments received for ${daysSincePayment} days`,
        actionRequired: true,
        suggestedAction: 'Check if client has active invoices and follow up',
        createdAt: new Date().toISOString()
      });
    }
  }

  return alerts;
}

/**
 * Calculate additional metrics
 */
function calculateAdditionalMetrics(invoices, payments) {
  const now = new Date();

  // Count invoices by status
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const partiallyPaidInvoices = invoices.filter(inv => inv.status === 'partially_paid').length;
  const unpaidInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
  const overdueInvoices = invoices.filter(inv => 
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  ).length;

  const activeDueInvoices = invoices.filter(inv => 
    (inv.total - inv.paidAmount) > 0 && inv.status !== 'draft'
  ).length;

  // Calculate amounts
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdueAmount = invoices.filter(inv => 
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  ).reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

  // Find oldest overdue
  const overdueInvoicesList = invoices.filter(inv => 
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const oldestOverdueDate = overdueInvoicesList.length > 0 ? overdueInvoicesList[0].dueDate : null;
  const daysOldestOverdue = oldestOverdueDate ? 
    Math.ceil((now - new Date(oldestOverdueDate)) / (1000 * 60 * 60 * 24)) : 0;

  // Find next due
  const futureDueInvoices = invoices.filter(inv => 
    inv.dueDate && new Date(inv.dueDate) >= now
  ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const nextDueDate = futureDueInvoices.length > 0 ? futureDueInvoices[0].dueDate : null;
  const daysUntilDue = nextDueDate ? 
    Math.ceil((new Date(nextDueDate) - now) / (1000 * 60 * 60 * 24)) : null;

  // Calculate percentages
  const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
  const onTimePaymentPercentage = invoices.length > 0 ?
    (invoices.filter(inv => {
      const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
      return payment && new Date(payment.paymentDate) <= new Date(inv.dueDate);
    }).length / invoices.length) * 100 : 0;
  const latePaymentPercentage = 100 - onTimePaymentPercentage;

  // Average values
  const averageInvoiceValue = invoices.length > 0 ? totalInvoiced / invoices.length : 0;
  const averagePaymentAmount = payments.length > 0 ? totalPaid / payments.length : 0;

  return {
    totalInvoices: invoices.length,
    paidInvoices,
    partiallyPaidInvoices,
    unpaidInvoices,
    overdueInvoices,
    activeDueInvoices,
    collectionRate,
    onTimePaymentPercentage,
    latePaymentPercentage,
    overdueAmount,
    averageInvoiceValue,
    averagePaymentAmount,
    oldestOverdueDate,
    daysOldestOverdue,
    nextDueDate,
    daysUntilDue
  };
}

/**
 * Determine payment velocity
 */
function determinePaymentVelocity(averageDaysToPayment) {
  if (averageDaysToPayment <= 10) return 'fast';
  if (averageDaysToPayment <= 30) return 'normal';
  return 'slow';
}

/**
 * Calculate median payment days
 */
function calculateMedianPaymentDays(invoices, payments) {
  const paymentDays = invoices
    .map(inv => {
      const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
      if (!payment) return null;
      
      const days = Math.ceil((new Date(payment.paymentDate) - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24));
      return days;
    })
    .filter(days => days !== null)
    .sort((a, b) => a - b);

  if (paymentDays.length === 0) return 0;
  
  const mid = Math.floor(paymentDays.length / 2);
  return paymentDays.length % 2 !== 0 ? paymentDays[mid] : (paymentDays[mid - 1] + paymentDays[mid]) / 2;
}

/**
 * Calculate payment frequency
 */
function calculatePaymentFrequency(payments) {
  if (payments.length < 2) return 'Irregular';

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const recentPayments = payments.filter(p => new Date(p.paymentDate) >= oneMonthAgo);
  
  if (recentPayments.length >= 2) return 'Frequent';
  if (recentPayments.length === 1) return 'Occasional';
  return 'Irregular';
}

// ========== ADDITIONAL HELPER FUNCTIONS ==========
// Add to backend/controller/dashboard.controller.js

/**
 * Calculate volatility index (payment consistency)
 */
export function calculateVolatilityIndex(invoices, payments) {
  const paymentDays = invoices
    .map(inv => {
      const payment = payments.find(p => p.invoiceId.toString() === inv._id.toString());
      if (!payment) return null;
      
      return Math.ceil((new Date(payment.paymentDate) - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
    })
    .filter(days => days !== null);

  if (paymentDays.length < 2) return 0;

  // Calculate mean
  const mean = paymentDays.reduce((a, b) => a + b) / paymentDays.length;
  
  // Calculate standard deviation
  const squareDiffs = paymentDays.map(days => Math.pow(days - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / paymentDays.length;
  const stdDev = Math.sqrt(avgSquareDiff);

  // Normalize to 0-100 scale
  return Math.min(100, (stdDev / 30) * 100);
}

/**
 * Calculate payment probability
 */
export function calculatePaymentProbability(factors, type) {
  let probability = 0;

  if (type === 'on-time') {
    // Higher payment score = higher probability
    const scoreBoost = (100 - (100 - factors.paymentReliabilityScore || 100)) * 0.01;
    
    // Lower days overdue = higher probability
    const overdueDeduction = Math.min(1, factors.averageDaysOverdue / 100);
    
    // Fewer recent late payments = higher probability
    const latePaymentDeduction = Math.min(1, factors.recentLatePayments / 5);
    
    probability = Math.max(0, Math.min(100, (scoreBoost * 100) - (overdueDeduction * 50) - (latePaymentDeduction * 30)));
  } else if (type === 'late') {
    // Based on history and trend
    const recentLateWeight = (factors.recentLatePayments / 3) * 40;
    const velocityWeight = factors.paymentVelocity === 'slow' ? 30 : factors.paymentVelocity === 'normal' ? 10 : 0;
    const scoreWeight = (100 - (factors.paymentReliabilityScore || 100)) * 0.3;
    
    probability = Math.min(100, recentLateWeight + velocityWeight + scoreWeight);
  } else if (type === 'very-late') {
    // High risk of very late payment
    const overdueWeight = Math.min(1, factors.averageDaysOverdue / 60) * 50;
    const slowVelocityWeight = factors.paymentVelocity === 'slow' ? 40 : 0;
    const scoreWeight = (100 - (factors.paymentReliabilityScore || 100)) * 0.4;
    
    probability = Math.min(100, overdueWeight + slowVelocityWeight + scoreWeight);
  }

  return parseFloat(Math.max(0, Math.min(100, probability)).toFixed(2));
}

/**
 * Get next review date based on risk level
 */
export function getNextReviewDate(riskLevel) {
  const now = new Date();
  
  if (riskLevel === 'HIGH') {
    // Review in 1 week
    now.setDate(now.getDate() + 7);
  } else if (riskLevel === 'MEDIUM') {
    // Review in 2 weeks
    now.setDate(now.getDate() + 14);
  } else {
    // Review in 1 month
    now.setMonth(now.getMonth() + 1);
  }
  
  return now.toISOString();
}