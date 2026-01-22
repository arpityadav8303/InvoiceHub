import Client from '../models/client.model.js';
import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';
import mongoose from 'mongoose';

export const getDashboardOverview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // 1. Total Clients Stats
    const clientStatsPromise = Client.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } }
        }
      }
    ]);

    // 2. Revenue & Invoice Stats
    const invoiceStatsPromise = Invoice.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalPaid: { $sum: "$paidAmount" },
          outstanding: { $sum: "$remainingAmount" },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$dueDate", new Date()] },
                    { $ne: ["$status", "paid"] }
                  ]
                },
                "$remainingAmount",
                0
              ]
            }
          },
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $in: ["$status", ["sent", "partially_paid", "draft"]] }, 1, 0] } },
          overdueCount: { $sum: { $cond: [{ $and: [{ $lt: ["$dueDate", new Date()] }, { $ne: ["$status", "paid"] }] }, 1, 0] } }
        }
      }
    ]);

    // 3. Monthly Revenue (Last 6 Months)
    const revenueGraphPromise = Payment.aggregate([
      {
        $match: {
          userId,
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$paymentDate" },
            year: { $year: "$paymentDate" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 4. Client Growth (Last 6 Months)
    const clientGrowthPromise = Client.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 5. Recent Activity (Latest 5 items)
    const recentPaymentsPromise = Payment.find({ userId })
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('clientId', 'firstName lastName')
      .lean();

    const recentInvoicesPromise = Invoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('clientId', 'firstName lastName')
      .lean();

    const recentClientsPromise = Client.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 6. Upcoming Invoices
    const upcomingInvoicesPromise = Invoice.find({
      userId,
      status: { $ne: 'paid' },
      dueDate: { $gte: new Date() }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('clientId', 'firstName lastName companyName')
      .lean();

    const [
      clientStatsRes,
      invoiceStatsRes,
      revenueGraph,
      clientGrowth,
      recentPayments,
      recentInvoices,
      recentClients,
      upcomingInvoices
    ] = await Promise.all([
      clientStatsPromise,
      invoiceStatsPromise,
      revenueGraphPromise,
      clientGrowthPromise,
      recentPaymentsPromise,
      recentInvoicesPromise,
      recentClientsPromise,
      upcomingInvoicesPromise
    ]);

    // --- Process Data for Frontend ---

    // Invoice Stats
    const stats = invoiceStatsRes[0] || {};
    const clients = clientStatsRes[0] || { total: 0, active: 0, inactive: 0 };

    // Process Revenue Graph - Fill missing months
    const processedRevenueData = fillMissingMonths(revenueGraph, sixMonthsAgo, 'total');

    // Process Client Growth - Fill missing months
    const processedClientGrowth = fillMissingMonths(clientGrowth, sixMonthsAgo, 'count');

    // Merge and Sort Recent Activity
    const activityList = [
      ...recentPayments.map(p => ({
        id: p._id,
        type: 'payment',
        message: `Payment of ₹${p.amount} received from ${p.clientId?.firstName} ${p.clientId?.lastName}`,
        time: p.paymentDate,
        amount: p.amount
      })),
      ...recentInvoices.map(i => ({
        id: i._id,
        type: 'invoice',
        message: `Invoice #${i.invoiceNumber} created for ${i.clientId?.firstName} ${i.clientId?.lastName}`,
        time: i.createdAt,
        amount: i.total
      })),
      ...recentClients.map(c => ({
        id: c._id,
        type: 'client',
        message: `New client "${c.businessName}" added`,
        time: c.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        // Key Stats
        totalClients: { active: clients.active, inactive: clients.inactive },
        totalRevenue: stats.totalRevenue || 0,
        outstandingAmount: stats.outstanding || 0,
        overdueAmount: stats.overdue || 0,
        paymentRate: stats.totalRevenue ? Math.round((stats.totalPaid / stats.totalRevenue) * 100) : 0,

        // Charts Data
        revenueData: processedRevenueData,
        clientGrowthData: processedClientGrowth,

        // Pie Chart Data
        invoiceStats: {
          paid: stats.paidCount || 0,
          pending: stats.pendingCount || 0,
          overdue: stats.overdueCount || 0
        },

        // Lists
        recentActivity: activityList,
        upcomingInvoices: upcomingInvoices.map(inv => ({
          id: inv.invoiceNumber,
          client: inv.clientId?.companyName || `${inv.clientId?.firstName} ${inv.clientId?.lastName}` || 'Unknown',
          amount: inv.total,
          dueDate: inv.dueDate
        }))
      }
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Fill missing months with 0
function fillMissingMonths(data, startDate, valueKey) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = [];
  const currentDate = new Date(startDate);
  const now = new Date();

  while (currentDate <= now) {
    const monthIdx = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = months[monthIdx];

    const found = data.find(item => item._id.month === (monthIdx + 1) && item._id.year === year);

    result.push({
      name: monthName,
      [valueKey === 'total' ? 'value' : 'clients']: found ? found[valueKey] : 0
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  return result;
}
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month', startDate, endDate, groupBy } = req.query;
    const userId = req.user._id;

    // ========== DATE RANGE CALCULATION ==========
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      end.setHours(23, 59, 59, 999);

      start = new Date();

      switch (timeRange) {
        case 'day':
          start.setDate(start.getDate() - 1);
          break;
        case 'week':
          start.setDate(start.getDate() - 7);
          break;
        case 'month':
          start.setMonth(start.getMonth() - 1);
          break;
        case 'year':
          start.setFullYear(start.getFullYear() - 1);
          break;
        default:
          start.setMonth(start.getMonth() - 1);
      }

      start.setHours(0, 0, 0, 0);
    }

    console.log(`📊 Revenue Analytics: ${start.toDateString()} to ${end.toDateString()}`);

    // ========== FETCH INVOICES & PAYMENTS ==========
    const invoices = await Invoice.find({
      userId: userId,
      invoiceDate: { $gte: start, $lte: end }
    })
      .populate('clientId', 'firstName lastName email companyName')
      .lean();

    const payments = await Payment.find({
      userId: userId,
      paymentDate: { $gte: start, $lte: end }
    })
      .populate('clientId', 'firstName lastName companyName')
      .lean();

    // ========== CALCULATE SUMMARY STATS ==========
    const summaryStats = calculateSummaryStats(invoices, payments);

    // ========== BREAKDOWN: OUTSTANDING VS PAID ==========
    const breakdown = calculateBreakdown(invoices, payments);

    // ========== TOP REVENUE CLIENTS ==========
    const topClients = calculateTopClients(invoices, payments);

    // ========== CASH FLOW PROJECTION ==========
    const cashFlowData = calculateCashFlow(invoices, payments, groupBy || 'week');

    // ========== INVOICE STATUS DISTRIBUTION ==========
    const statusDistribution = calculateStatusDistribution(invoices);

    // ========== PAYMENT METHOD BREAKDOWN ==========
    const paymentMethodBreakdown = calculatePaymentMethodBreakdown(payments);

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Revenue analytics fetched successfully',
      data: {
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
          timeRange,
          days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        },
        summary: summaryStats,
        breakdown,
        topClients,
        cashFlow: cashFlowData,
        invoiceStatusDistribution: statusDistribution,
        paymentMethodBreakdown,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Revenue Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate summary statistics
 */
function calculateSummaryStats(invoices, payments) {
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return {
    totalInvoiced: parseFloat(totalInvoiced.toFixed(2)),
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
    averageInvoiceValue: invoices.length > 0
      ? parseFloat((totalInvoiced / invoices.length).toFixed(2))
      : 0,
    collectionRate: totalInvoiced > 0
      ? parseFloat(((totalPaid / totalInvoiced) * 100).toFixed(2))
      : 0,
    invoiceCount: invoices.length,
    paymentCount: payments.length,
    averagePaymentValue: payments.length > 0
      ? parseFloat((totalPaid / payments.length).toFixed(2))
      : 0
  };
}

/**
 * Outstanding vs Paid breakdown
 */
function calculateBreakdown(invoices, payments) {
  // Group invoices by status
  const byStatus = {
    paid: 0,
    partially_paid: 0,
    outstanding: 0,
    overdue: 0
  };

  const now = new Date();

  invoices.forEach(invoice => {
    if (invoice.status === 'paid') {
      byStatus.paid += invoice.total;
    } else if (invoice.status === 'partially_paid') {
      byStatus.partially_paid += (invoice.total - invoice.paidAmount);
    } else if (invoice.dueDate && new Date(invoice.dueDate) < now) {
      byStatus.overdue += (invoice.total - invoice.paidAmount);
    } else {
      byStatus.outstanding += (invoice.total - invoice.paidAmount);
    }
  });

  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  return {
    byStatus: {
      paid: {
        amount: parseFloat(byStatus.paid.toFixed(2)),
        percentage: total > 0 ? parseFloat(((byStatus.paid / total) * 100).toFixed(2)) : 0
      },
      partiallyPaid: {
        amount: parseFloat(byStatus.partially_paid.toFixed(2)),
        percentage: total > 0 ? parseFloat(((byStatus.partially_paid / total) * 100).toFixed(2)) : 0
      },
      outstanding: {
        amount: parseFloat(byStatus.outstanding.toFixed(2)),
        percentage: total > 0 ? parseFloat(((byStatus.outstanding / total) * 100).toFixed(2)) : 0
      },
      overdue: {
        amount: parseFloat(byStatus.overdue.toFixed(2)),
        percentage: total > 0 ? parseFloat(((byStatus.overdue / total) * 100).toFixed(2)) : 0
      }
    },
    total: parseFloat(total.toFixed(2))
  };
}

/**
 * Top 10 revenue generating clients
 */
function calculateTopClients(invoices, payments) {
  const clientMap = new Map();

  // Sum invoices by client
  invoices.forEach(invoice => {
    const clientId = invoice.clientId._id.toString();
    const clientName = `${invoice.clientId.firstName} ${invoice.clientId.lastName}`;
    const companyName = invoice.clientId.companyName || 'N/A';

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        clientId,
        clientName,
        companyName,
        email: invoice.clientId.email,
        invoiced: 0,
        paid: 0,
        outstanding: 0,
        invoiceCount: 0
      });
    }

    const client = clientMap.get(clientId);
    client.invoiced += invoice.total;
    client.outstanding += invoice.total - invoice.paidAmount;
    client.invoiceCount += 1;
  });

  // Add payment amounts
  payments.forEach(payment => {
    const clientId = payment.clientId._id.toString();
    if (clientMap.has(clientId)) {
      const client = clientMap.get(clientId);
      client.paid += payment.amount;
      client.outstanding = client.invoiced - client.paid;
    }
  });

  // Convert to array, sort, and get top 10
  return Array.from(clientMap.values())
    .map(client => ({
      ...client,
      invoiced: parseFloat(client.invoiced.toFixed(2)),
      paid: parseFloat(client.paid.toFixed(2)),
      outstanding: parseFloat(client.outstanding.toFixed(2)),
      collectionRate: client.invoiced > 0
        ? parseFloat(((client.paid / client.invoiced) * 100).toFixed(2))
        : 0
    }))
    .sort((a, b) => b.invoiced - a.invoiced)
    .slice(0, 10);
}

/**
 * Cash Flow data for trend visualization
 */
function calculateCashFlow(invoices, payments, groupBy = 'week') {
  const cashFlowMap = new Map();

  // Initialize date groups
  const initializeGroups = (start, end, groupBy) => {
    const groups = new Map();
    let current = new Date(start);

    while (current <= end) {
      const key = getGroupKey(current, groupBy);
      if (!groups.has(key)) {
        groups.set(key, {
          period: key,
          invoiced: 0,
          paid: 0,
          outstanding: 0,
          invoiceCount: 0,
          paymentCount: 0,
          startDate: new Date(current),
          endDate: new Date(current)
        });
      }
      advanceDate(current, groupBy);
    }
    return groups;
  };

  // Get start and end dates
  const allDates = [
    ...invoices.map(i => new Date(i.invoiceDate)),
    ...payments.map(p => new Date(p.paymentDate))
  ];

  if (allDates.length === 0) {
    return [];
  }

  const start = new Date(Math.min(...allDates));
  const end = new Date(Math.max(...allDates));

  const groups = initializeGroups(start, end, groupBy);

  // Add invoice data
  invoices.forEach(invoice => {
    const key = getGroupKey(new Date(invoice.invoiceDate), groupBy);
    if (groups.has(key)) {
      const group = groups.get(key);
      group.invoiced += invoice.total;
      group.outstanding += invoice.total - invoice.paidAmount;
      group.invoiceCount += 1;
    }
  });

  // Add payment data
  payments.forEach(payment => {
    const key = getGroupKey(new Date(payment.paymentDate), groupBy);
    if (groups.has(key)) {
      const group = groups.get(key);
      group.paid += payment.amount;
      group.outstanding -= payment.amount;
      group.paymentCount += 1;
    }
  });

  return Array.from(groups.values())
    .map(group => ({
      period: group.period,
      invoiced: parseFloat(group.invoiced.toFixed(2)),
      paid: parseFloat(group.paid.toFixed(2)),
      outstanding: parseFloat(group.outstanding.toFixed(2)),
      invoiceCount: group.invoiceCount,
      paymentCount: group.paymentCount,
      netCashFlow: parseFloat((group.paid - group.invoiced).toFixed(2))
    }))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

/**
 * Invoice status distribution
 */
function calculateStatusDistribution(invoices) {
  const distribution = {
    draft: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    partially_paid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 }
  };

  const now = new Date();

  invoices.forEach(invoice => {
    const status = invoice.status || 'draft';
    distribution[status].count += 1;
    distribution[status].amount += invoice.total;

    // Count overdue separately
    if (invoice.dueDate && new Date(invoice.dueDate) < now && status !== 'paid') {
      distribution.overdue.count += 1;
      distribution.overdue.amount += invoice.total - invoice.paidAmount;
    }
  });

  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);

  const result = {};
  Object.entries(distribution).forEach(([status, data]) => {
    result[status] = {
      count: data.count,
      amount: parseFloat(data.amount.toFixed(2)),
      percentage: total > 0 ? parseFloat(((data.amount / total) * 100).toFixed(2)) : 0
    };
  });

  return result;
}

/**
 * Payment method breakdown
 */
function calculatePaymentMethodBreakdown(payments) {
  const methods = {};

  payments.forEach(payment => {
    const method = payment.paymentMethod || 'unknown';
    if (!methods[method]) {
      methods[method] = { count: 0, amount: 0 };
    }
    methods[method].count += 1;
    methods[method].amount += payment.amount;
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  const result = {};
  Object.entries(methods).forEach(([method, data]) => {
    result[method] = {
      count: data.count,
      amount: parseFloat(data.amount.toFixed(2)),
      percentage: total > 0 ? parseFloat(((data.amount / total) * 100).toFixed(2)) : 0
    };
  });

  return result;
}

/**
 * Helper: Get group key based on groupBy parameter
 */
function getGroupKey(date, groupBy) {
  const d = new Date(date);

  switch (groupBy) {
    case 'day':
      return d.toISOString().split('T')[0];
    case 'week':
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return `Week of ${weekStart.toISOString().split('T')[0]}`;
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    default:
      return d.toISOString().split('T')[0];
  }
}

/**
 * Helper: Advance date by period
 */
function advanceDate(date, groupBy) {
  switch (groupBy) {
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
  }
}

/**
 * Get Overall Revenue Summary (Quick Stats)
 * GET /api/dashboard/revenue/summary
 */
export const getRevenueSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = 'month' } = req.query;

    const start = new Date();
    const end = new Date();

    switch (timeRange) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const invoices = await Invoice.find({
      userId: userId,
      invoiceDate: { $gte: start, $lte: end }
    }).lean();

    const payments = await Payment.find({
      userId: userId,
      paymentDate: { $gte: start, $lte: end }
    }).lean();

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        timeRange,
        totalInvoiced: parseFloat(totalInvoiced.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalOutstanding: parseFloat((totalInvoiced - totalPaid).toFixed(2)),
        collectionRate: totalInvoiced > 0
          ? parseFloat(((totalPaid / totalInvoiced) * 100).toFixed(2))
          : 0
      }
    });
  } catch (error) {
    console.error('Revenue Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue summary',
      error: error.message
    });
  }
};

export const getAdvancedClientList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'name',
      sortOrder = 'desc',
      filter = 'all',
      searchQuery = '',
      riskLevel = '',
      status = ''
    } = req.query;

    const userId = new mongoose.Types.ObjectId(req.user._id);
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Cap at 100
    const skip = (pageNum - 1) * limitNum;

    // ========== BUILD MATCH STAGE ==========
    const matchStage = { $match: { userId } };

    // Filter by status (active/inactive)
    if (filter === 'active') {
      matchStage.$match.status = 'active';
    } else if (filter === 'inactive') {
      matchStage.$match.status = 'inactive';
    }

    // Filter by risk level
    if (riskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(riskLevel)) {
      matchStage.$match.riskLevel = riskLevel;
    }

    // ========== BUILD SEARCH STAGE (TEXT/REGEX) ==========
    let searchStage = null;
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery.trim(), 'i');
      matchStage.$match.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
        { companyName: { $regex: regex } },
        { phone: { $regex: regex } }
      ];
    }

    // ========== LOOKUP INVOICES FOR CALCULATIONS ==========
    const lookupStage = {
      $lookup: {
        from: 'invoices',
        let: { clientId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$clientId', '$$clientId'] },
              status: { $ne: 'draft' }
            }
          }
        ],
        as: 'invoices'
      }
    };

    // ========== ADD COMPUTED FIELDS ==========
    const addFieldsStage = {
      $addFields: {
        // Calculate total due (invoiced - paid)
        totalDue: {
          $sum: {
            $map: {
              input: '$invoices',
              as: 'inv',
              in: { $subtract: ['$$inv.total', '$$inv.paidAmount'] }
            }
          }
        },
        // Calculate overdue amount
        overdueAmount: {
          $sum: {
            $map: {
              input: '$invoices',
              as: 'inv',
              in: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$$inv.dueDate', new Date()] },
                      { $ne: ['$$inv.status', 'paid'] }
                    ]
                  },
                  { $subtract: ['$$inv.total', '$$inv.paidAmount'] },
                  0
                ]
              }
            }
          }
        },
        // Count current due invoices
        currentDueInvoicesCount: {
          $size: {
            $filter: {
              input: '$invoices',
              as: 'inv',
              cond: { $gt: [{ $subtract: ['$$inv.total', '$$inv.paidAmount'] }, 0] }
            }
          }
        },
        // Get next due date
        nextDueDate: {
          $min: {
            $map: {
              input: '$invoices',
              as: 'inv',
              in: '$$inv.dueDate'
            }
          }
        }
      }
    };

    // ========== DETERMINE PAYMENT STATUS & RISK LEVEL ==========
    const addStatusStage = {
      $addFields: {
        paymentStatus: {
          $cond: [
            { $eq: ['$paymentStats.totalInvoices', 0] },
            'no-payment',
            {
              $cond: [
                { $gt: ['$paymentStats.latePayments', 0] },
                'late',
                'on-time'
              ]
            }
          ]
        },
        // Calculate risk score (0-100)
        riskScore: {
          $add: [
            // Base from reliability score (inverse)
            { $multiply: [{ $subtract: [100, '$paymentStats.paymentReliabilityScore'] }, 0.4] },
            // Add points for late payments
            { $multiply: ['$paymentStats.latePayments', 5] },
            // Add points for current overdue
            {
              $cond: [
                { $gt: ['$overdueAmount', 0] },
                { $multiply: [{ $log: [{ $add: ['$overdueAmount', 1], }, 10] }, 2] },
                0
              ]
            }
          ]
        },
        // Determine if at risk
        isAtRisk: {
          $or: [
            { $gt: ['$overdueAmount', 0] },
            { $lt: ['$paymentStats.paymentReliabilityScore', 60] }
          ]
        }
      }
    };

    // ========== NORMALIZE RISK SCORE ==========
    const normalizeRiskStage = {
      $addFields: {
        riskScore: {
          $min: [
            100,
            {
              $max: [
                0,
                '$riskScore'
              ]
            }
          ]
        }
      }
    };

    // ========== FILTER BY PAYMENT STATUS & OVERDUE ==========
    const filterStage = { $match: {} };

    if (status === 'on-time') {
      filterStage.$match.paymentStatus = 'on-time';
    } else if (status === 'late') {
      filterStage.$match.paymentStatus = 'late';
    } else if (status === 'no-payment') {
      filterStage.$match.paymentStatus = 'no-payment';
    }

    if (filter === 'overdue') {
      filterStage.$match.overdueAmount = { $gt: 0 };
    } else if (filter === 'atRisk') {
      filterStage.$match.isAtRisk = true;
    }

    // ========== DETERMINE SORT FIELD & ORDER ==========
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    let sortField = { firstName: 1, lastName: 1 }; // Default: name

    switch (sort) {
      case 'name':
        sortField = { firstName: 1, lastName: 1 };
        break;
      case 'paymentScore':
        sortField = { 'paymentStats.paymentReliabilityScore': sortOrderValue };
        break;
      case 'dueDate':
        sortField = { nextDueDate: sortOrderValue };
        break;
      case 'totalAmount':
        sortField = { 'paymentStats.totalAmount': sortOrderValue };
        break;
      case 'lastPaymentDate':
        sortField = { 'paymentStats.lastPaymentDate': sortOrderValue };
        break;
      case 'createdAt':
        sortField = { createdAt: sortOrderValue };
        break;
      case 'riskScore':
        sortField = { riskScore: sortOrderValue };
        break;
      default:
        sortField = { firstName: 1, lastName: 1 };
    }

    const sortStage = { $sort: sortField };

    // ========== BUILD AGGREGATION PIPELINE ==========
    const aggregationPipeline = [
      matchStage,
      lookupStage,
      addFieldsStage,
      addStatusStage,
      normalizeRiskStage,
      filterStage,
      sortStage,
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                phone: 1,
                companyName: 1,
                status: 1,
                riskLevel: 1,
                paymentStats: 1,
                totalDue: 1,
                overdueAmount: 1,
                currentDueInvoicesCount: 1,
                nextDueDate: 1,
                paymentStatus: 1,
                riskScore: 1,
                isAtRisk: 1,
                createdAt: 1,
                updatedAt: 1,
                currentDueInvoices: {
                  $slice: [
                    {
                      $filter: {
                        input: '$invoices',
                        as: 'inv',
                        cond: {
                          $gt: [
                            { $subtract: ['$$inv.total', '$$inv.paidAmount'] },
                            0
                          ]
                        }
                      }
                    },
                    5 // Limit to 5 invoices
                  ]
                }
              }
            }
          ]
        }
      }
    ];

    // ========== EXECUTE AGGREGATION ==========
    const result = await Client.aggregate(aggregationPipeline);

    const totalClients = result[0]?.metadata[0]?.total || 0;
    const clients = result[0]?.data || [];
    const totalPages = Math.ceil(totalClients / limitNum);

    // ========== FORMAT RESPONSE ==========
    const formattedClients = clients.map(client => ({
      _id: client._id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName,
      status: client.status,
      riskLevel: client.riskLevel,
      paymentStats: {
        totalInvoices: client.paymentStats.totalInvoices,
        totalAmount: parseFloat((client.paymentStats.totalAmount || 0).toFixed(2)),
        totalPaid: parseFloat((client.paymentStats.totalPaid || 0).toFixed(2)),
        totalUnpaid: parseFloat((client.paymentStats.totalUnpaid || 0).toFixed(2)),
        paymentReliabilityScore: client.paymentStats.paymentReliabilityScore,
        onTimePayments: client.paymentStats.onTimePayments,
        latePayments: client.paymentStats.latePayments,
        averageDaysToPayment: client.paymentStats.averageDaysToPayment,
        lastPaymentDate: client.paymentStats.lastPaymentDate
      },
      totalDue: parseFloat((client.totalDue || 0).toFixed(2)),
      overdueAmount: parseFloat((client.overdueAmount || 0).toFixed(2)),
      currentDueInvoicesCount: client.currentDueInvoicesCount,
      nextDueDate: client.nextDueDate,
      paymentStatus: client.paymentStatus,
      riskScore: parseFloat((client.riskScore || 0).toFixed(2)),
      isAtRisk: client.isAtRisk,
      currentDueInvoices: (client.currentDueInvoices || []).map(inv => ({
        invoiceId: inv._id,
        invoiceNumber: inv.invoiceNumber,
        amount: parseFloat((inv.total || 0).toFixed(2)),
        dueDate: inv.dueDate,
        daysOverdue: calculateDaysOverdue(inv.dueDate)
      })),
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }));

    // ========== CALCULATE SUMMARY STATS ==========
    const summaryStats = calculateClientListSummary(formattedClients, totalClients);

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Client list fetched successfully',
      data: {
        clients: formattedClients,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalClients,
          totalPages: totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        stats: summaryStats,
        appliedFilters: {
          sort,
          sortOrder,
          filter,
          riskLevel: riskLevel || 'all',
          status: status || 'all',
          searchQuery: searchQuery.trim() || 'none'
        }
      }
    });
  } catch (error) {
    console.error('Advanced Client List Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client list',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate days overdue
 */
function calculateDaysOverdue(dueDate) {
  if (!dueDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due >= today) return 0;

  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate summary statistics for client list
 */
function calculateClientListSummary(clients, totalCount) {
  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const atRiskCount = clients.filter(c => c.isAtRisk).length;
  const overdueCount = clients.filter(c => c.overdueAmount > 0).length;

  const avgPaymentScore = clients.length > 0
    ? (clients.reduce((sum, c) => sum + c.paymentStats.paymentReliabilityScore, 0) / clients.length)
    : 0;

  const totalDue = clients.reduce((sum, c) => sum + c.totalDue, 0);
  const totalOverdue = clients.reduce((sum, c) => sum + c.overdueAmount, 0);

  return {
    activeClients: activeCount,
    inactiveClients: inactiveCount,
    atRiskCount,
    overdueCount,
    averagePaymentScore: parseFloat(avgPaymentScore.toFixed(2)),
    totalDue: parseFloat(totalDue.toFixed(2)),
    totalOverdue: parseFloat(totalOverdue.toFixed(2)),
    riskDistribution: {
      low: clients.filter(c => c.riskLevel === 'LOW').length,
      medium: clients.filter(c => c.riskLevel === 'MEDIUM').length,
      high: clients.filter(c => c.riskLevel === 'HIGH').length
    },
    paymentStatusDistribution: {
      onTime: clients.filter(c => c.paymentStatus === 'on-time').length,
      late: clients.filter(c => c.paymentStatus === 'late').length,
      noPayment: clients.filter(c => c.paymentStatus === 'no-payment').length
    }
  };
}



/**
 * Get Comprehensive Client Profile
 * GET /api/dashboard/clients/:id/profile
 */
export const getClientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // ========== VALIDATE CLIENT ==========
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

    // ========== FETCH INVOICES & PAYMENTS ==========
    const invoices = await Invoice.find({ clientId: id })
      .sort({ invoiceDate: -1 })
      .lean();

    const payments = await Payment.find({ clientId: id })
      .sort({ paymentDate: -1 })
      .lean();

    // ========== CALCULATE INVOICE SUMMARY ==========
    const invoiceSummary = calculateInvoiceSummary(invoices);

    // ========== GET RECENT INVOICES ==========
    const recentInvoices = invoices.slice(0, 5).map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      amount: parseFloat((inv.total || 0).toFixed(2)),
      status: inv.status,
      dueDate: inv.dueDate,
      paidAmount: parseFloat((inv.paidAmount || 0).toFixed(2)),
      remainingAmount: parseFloat((inv.remainingAmount || 0).toFixed(2))
    }));

    // ========== GET PAYMENT HISTORY ==========
    const paymentHistory = payments.slice(0, 5).map(pay => ({
      amount: parseFloat((pay.amount || 0).toFixed(2)),
      paymentDate: pay.paymentDate,
      paymentMethod: pay.paymentMethod,
      transactionId: pay.transactionId
    }));

    // ========== CALCULATE RELATIONSHIP LENGTH ==========
    const relationshipLength = calculateRelationshipLength(client.createdAt);

    // ========== BUILD RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Client profile fetched successfully',
      data: {
        // BASIC INFO
        basicInfo: {
          _id: client._id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          companyName: client.companyName || 'N/A',
          status: client.status,
          riskLevel: client.riskLevel,
          createdAt: client.createdAt
        },

        // CONTACT INFO
        contactInfo: {
          email: client.email,
          phone: client.phone,
          address: {
            street: client.address?.street || 'N/A',
            city: client.address?.city || 'N/A',
            state: client.address?.state || 'N/A',
            zipCode: client.address?.zipCode || 'N/A'
          },
          gstNumber: client.gstNumber || 'N/A',
          preferredPaymentMethod: client.preferredPaymentMethod || 'bank_transfer'
        },

        // PAYMENT STATS
        paymentStats: {
          totalInvoices: client.paymentStats.totalInvoices,
          totalAmount: parseFloat((client.paymentStats.totalAmount || 0).toFixed(2)),
          totalPaid: parseFloat((client.paymentStats.totalPaid || 0).toFixed(2)),
          totalUnpaid: parseFloat((client.paymentStats.totalUnpaid || 0).toFixed(2)),
          paymentReliabilityScore: client.paymentStats.paymentReliabilityScore,
          onTimePayments: client.paymentStats.onTimePayments,
          latePayments: client.paymentStats.latePayments,
          averageDaysToPayment: client.paymentStats.averageDaysToPayment,
          lastPaymentDate: client.paymentStats.lastPaymentDate,
          lastInvoiceDate: client.paymentStats.lastInvoiceDate
        },

        // INVOICE SUMMARY
        invoiceSummary,

        // RECENT INVOICES
        recentInvoices: {
          count: recentInvoices.length,
          invoices: recentInvoices
        },

        // PAYMENT HISTORY
        paymentHistory: {
          count: paymentHistory.length,
          payments: paymentHistory,
          totalPayments: payments.length
        },

        // RELATIONSHIP INFO
        relationshipInfo: {
          customerSince: client.createdAt,
          relationshipLength: relationshipLength,
          notes: client.notes || 'No notes'
        },

        // SUMMARY METRICS
        summaryMetrics: {
          collectionRate: calculateCollectionRate(client.paymentStats),
          averageInvoiceValue: invoices.length > 0
            ? parseFloat((client.paymentStats.totalAmount / client.paymentStats.totalInvoices).toFixed(2))
            : 0,
          outstandingDays: calculateOutstandingDays(invoices)
        }
      }
    });
  } catch (error) {
    console.error('Client Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client profile',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate invoice summary by status
 */
function calculateInvoiceSummary(invoices) {
  const now = new Date();

  const draft = invoices.filter(inv => inv.status === 'draft').length;
  const sent = invoices.filter(inv => inv.status === 'sent').length;
  const paid = invoices.filter(inv => inv.status === 'paid').length;
  const partiallyPaid = invoices.filter(inv => inv.status === 'partially_paid').length;

  const overdue = invoices.filter(inv =>
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  ).length;

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  return {
    draft,
    sent,
    paid,
    partiallyPaid,
    overdue,
    totalInvoices: invoices.length,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    paidAmount: parseFloat(paidAmount.toFixed(2)),
    unpaidAmount: parseFloat(unpaidAmount.toFixed(2))
  };
}

/**
 * Calculate collection rate percentage
 */
function calculateCollectionRate(paymentStats) {
  if (paymentStats.totalAmount === 0) return 0;

  const rate = (paymentStats.totalPaid / paymentStats.totalAmount) * 100;
  return parseFloat(rate.toFixed(2));
}

/**
 * Calculate relationship length in readable format
 */
function calculateRelationshipLength(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);

  const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth());

  if (monthsDiff < 1) {
    return 'Less than a month';
  } else if (monthsDiff < 12) {
    return `${monthsDiff} month(s)`;
  } else {
    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;
    return months > 0
      ? `${years} year(s) and ${months} month(s)`
      : `${years} year(s)`;
  }
}

/**
 * Calculate average days invoices remain outstanding
 */
function calculateOutstandingDays(invoices) {
  const now = new Date();
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

  if (unpaidInvoices.length === 0) return 0;

  const totalDays = unpaidInvoices.reduce((sum, inv) => {
    const createdDate = new Date(inv.invoiceDate);
    const days = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round(totalDays / unpaidInvoices.length);
}