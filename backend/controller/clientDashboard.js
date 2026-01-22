// ==================== CONTROLLER ====================
// backend/controller/client.controller.js (Add this function)

import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';
import Client from '../models/client.model.js';
import User from '../models/user.model.js';

/**
 * Get Client Dashboard Overview
 * GET /api/client/dashboard/overview
 * 
 * Returns quick stats visible on client dashboard home
 */
export const getClientDashboardOverview = async (req, res) => {
  try {
    const clientId = req.client._id; // From auth middleware

    // ========== FETCH INVOICES ==========
    const invoices = await Invoice.find({ clientId })
      .select('invoiceNumber total paidAmount remainingAmount status dueDate invoiceDate')
      .lean();

    // ========== FETCH PAYMENTS ==========
    const payments = await Payment.find({ clientId })
      .select('amount paymentDate paymentMethod status')
      .lean();

    // ========== CALCULATE STATS ==========
    const stats = calculateStats(invoices, payments);

    // ========== BUILD RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Dashboard overview fetched successfully',
      data: {
        // SUMMARY CARDS
        summaryCards: {
          totalInvoices: {
            label: 'Total Invoices',
            value: stats.totalInvoices,
            trend: 'neutral'
          },
          totalAmount: {
            label: 'Total Amount',
            value: `$${stats.totalAmount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`,
            trend: 'neutral'
          },
          amountPaid: {
            label: 'Amount Paid',
            value: `$${stats.amountPaid.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`,
            trend: 'positive'
          },
          amountOutstanding: {
            label: 'Outstanding',
            value: `$${stats.amountOutstanding.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`,
            trend: stats.amountOutstanding === 0 ? 'positive' : 'warning'
          }
        },

        // STATUS INDICATORS
        statusIndicators: {
          collectionRate: {
            label: 'Your Payment Rate',
            percentage: stats.collectionRate,
            status: stats.collectionRate >= 80 ? 'excellent' :
              stats.collectionRate >= 60 ? 'good' :
                stats.collectionRate >= 40 ? 'fair' : 'poor',
            description: `${stats.collectionRate}% of invoices paid on time`
          },

          invoiceStatus: {
            paid: {
              count: stats.paidCount,
              label: 'Paid',
              color: 'green'
            },
            partially_paid: {
              count: stats.partiallyPaidCount,
              label: 'Partially Paid',
              color: 'blue'
            },
            unpaid: {
              count: stats.unpaidCount,
              label: 'Unpaid',
              color: 'yellow'
            },
            overdue: {
              count: stats.overdueCount,
              label: 'Overdue',
              color: 'red'
            }
          },

          dueSoonSummary: {
            totalDueToday: stats.dueToday.total,
            countDueToday: stats.dueToday.count,
            totalDueThisWeek: stats.dueThisWeek.total,
            countDueThisWeek: stats.dueThisWeek.count,
            totalOverdue: stats.totalOverdue,
            countOverdue: stats.overdueCount
          }
        },

        // RECENT INVOICES
        recentInvoices: {
          count: stats.recentInvoices.length,
          invoices: stats.recentInvoices.slice(0, 5).map(inv => ({
            invoiceNumber: inv.invoiceNumber,
            amount: parseFloat(inv.total.toFixed(2)),
            status: inv.status,
            dueDate: inv.dueDate,
            paidAmount: parseFloat(inv.paidAmount.toFixed(2)),
            remainingAmount: parseFloat(inv.remainingAmount.toFixed(2)),
            isOverdue: new Date(inv.dueDate) < new Date() && inv.status !== 'paid',
            daysUntilDue: calculateDaysUntilDue(inv.dueDate)
          }))
        },

        // RECENT PAYMENTS
        recentPayments: {
          count: stats.recentPayments.length,
          payments: stats.recentPayments.slice(0, 5).map(pay => ({
            amount: parseFloat(pay.amount.toFixed(2)),
            paymentDate: pay.paymentDate,
            paymentMethod: pay.paymentMethod,
            status: pay.status
          }))
        },

        // QUICK ACTIONS
        quickActions: {
          hasUnpaidInvoices: stats.unpaidCount > 0,
          unpaidAmount: parseFloat(stats.amountOutstanding.toFixed(2)),
          paymentUrl: stats.unpaidCount > 0 ? '/client/payments' : null,
          downloadPdfUrl: stats.recentInvoices.length > 0 ? '/client/invoices' : null
        },

        // TIMESTAMP
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message
    });
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Calculate all dashboard statistics
 */
function calculateStats(invoices, payments) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);

  // Basic counts
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const amountPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const amountOutstanding = totalAmount - amountPaid;

  // Count by status
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const partiallyPaidCount = invoices.filter(inv => inv.status === 'partially_paid').length;
  const unpaidCount = invoices.filter(inv =>
    inv.status === 'sent' || inv.status === 'draft'
  ).length;

  // Overdue invoices
  const overdueInvoices = invoices.filter(inv =>
    inv.dueDate && new Date(inv.dueDate) < now && inv.status !== 'paid'
  );
  const overdueCount = overdueInvoices.length;
  const totalOverdue = overdueInvoices.reduce((sum, inv) =>
    sum + (inv.remainingAmount || 0), 0
  );

  // Due today
  const dueToday = invoices.filter(inv => {
    const dueDate = new Date(inv.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === now.getTime() && inv.status !== 'paid';
  });

  // Due this week
  const dueThisWeek = invoices.filter(inv => {
    const dueDate = new Date(inv.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= now && dueDate <= oneWeekLater && inv.status !== 'paid';
  });

  // Collection rate
  const collectionRate = totalAmount > 0
    ? Math.round((amountPaid / totalAmount) * 100)
    : 0;

  // Recent invoices (sorted by date, newest first)
  const recentInvoices = [...invoices].sort((a, b) =>
    new Date(b.invoiceDate) - new Date(a.invoiceDate)
  );

  // Recent payments (sorted by date, newest first)
  const recentPayments = [...payments].sort((a, b) =>
    new Date(b.paymentDate) - new Date(a.paymentDate)
  );

  return {
    totalInvoices,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    amountPaid: parseFloat(amountPaid.toFixed(2)),
    amountOutstanding: parseFloat(amountOutstanding.toFixed(2)),
    paidCount,
    partiallyPaidCount,
    unpaidCount,
    overdueCount,
    totalOverdue: parseFloat(totalOverdue.toFixed(2)),
    collectionRate,
    dueToday: {
      total: parseFloat(dueToday.reduce((sum, inv) =>
        sum + (inv.remainingAmount || 0), 0).toFixed(2)),
      count: dueToday.length
    },
    dueThisWeek: {
      total: parseFloat(dueThisWeek.reduce((sum, inv) =>
        sum + (inv.remainingAmount || 0), 0).toFixed(2)),
      count: dueThisWeek.length
    },
    recentInvoices,
    recentPayments
  };
}

/**
 * Calculate days until due (negative if overdue)
 */
function calculateDaysUntilDue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const getInvoiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.client._id;

    // Get invoice
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check authorization
    if (invoice.clientId.toString() !== clientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get business info
    const user = await User.findById(invoice.userId);

    // Response
    res.status(200).json({
      success: true,
      message: 'Invoice details fetched',
      data: {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,

        // Items
        items: invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: parseFloat(item.rate.toFixed(2)),
          amount: parseFloat(item.amount.toFixed(2))
        })),

        // Totals
        subtotal: parseFloat(invoice.subtotal.toFixed(2)),
        discount: parseFloat(invoice.discount.toFixed(2)),
        taxRate: invoice.taxRate,
        tax: parseFloat(invoice.tax.toFixed(2)),
        total: parseFloat(invoice.total.toFixed(2)),

        // Payment Info
        paidAmount: parseFloat(invoice.paidAmount.toFixed(2)),
        remainingAmount: parseFloat(invoice.remainingAmount.toFixed(2)),
        status: invoice.status,
        paymentTerms: invoice.paymentTerms,
        paymentHistory: invoice.paymentHistory.map(pay => ({
          amount: parseFloat(pay.amount.toFixed(2)),
          paymentDate: pay.paymentDate,
          paymentMethod: pay.paymentMethod
        })),

        // Business Info
        business: {
          name: user?.businessName,
          email: user?.email,
          phone: user?.phone,
          address: {
            street: user?.address?.street,
            city: user?.address?.city,
            state: user?.address?.state,
            zipCode: user?.address?.zipCode
          },
          gstNumber: user?.gstNumber
        },

        // Notes
        notes: invoice.notes
      }
    });

  } catch (error) {
    console.error('Get Invoice Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  let pdfPath = null;
  try {
    const { id } = req.params;
    const clientId = req.client._id;

    // Get invoice
    const invoice = await Invoice.findById(id).populate('userId');
    if (!invoice || invoice.clientId.toString() !== clientId.toString()) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate PDF
    pdfPath = await generateInvoicePDF(invoice, req.client, invoice.userId);

    // Send file
    res.download(pdfPath, `${invoice.invoiceNumber}.pdf`, (err) => {
      if (pdfPath) deletePDF(pdfPath);
    });

  } catch (error) {
    console.error('Download PDF Error:', error);
    if (pdfPath) deletePDF(pdfPath);
    res.status(500).json({
      success: false,
      message: 'Error downloading PDF',
      error: error.message
    });
  }
};

// ========== 2.1: FETCH ALL INVOICES ==========
export const getClientInvoices = async (req, res) => {
  try {
    const clientId = req.client._id;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { clientId };
    if (status && status !== 'all') {
      const statuses = status.split(',');
      if (statuses.length > 1) {
        query.status = { $in: statuses };
      } else {
        query.status = status;
      }
    }

    // DIAGNOSTIC LOGS
    const totalForClient = await Invoice.countDocuments({ clientId });
    console.log(`[DEBUG] ClientId: ${clientId}`);
    console.log(`[DEBUG] Total Invoices for Client: ${totalForClient}`);
    console.log(`[DEBUG] Filter Query:`, JSON.stringify(query, null, 2));
    const matchingCount = await Invoice.countDocuments(query);
    console.log(`[DEBUG] Matching Invoices: ${matchingCount}`);

    // Check if any invoices exist with these statuses but maybe case mismatch?
    if (matchingCount === 0 && totalForClient > 0) {
      const distinctStatuses = await Invoice.distinct('status', { clientId });
      console.log(`[DEBUG] Actual Distinct Statuses for Client:`, distinctStatuses);
    }
    // END DIAGNOSTICS

    const invoices = await Invoice.find(query)
      .sort({ invoiceDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Invoices fetched successfully',
      data: {
        invoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching invoices' });
  }
};

// ========== 3.1: PAYMENT HISTORY ==========
/**
 * Get Payment History
 * GET /api/client/payments
 * Query: page=1, limit=10, sort=date
 */
export const getClientPayments = async (req, res) => {
  try {
    const clientId = req.client._id;
    const { page = 1, limit = 10, sort = 'date' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort option
    const sortOption = sort === 'amount' ? { amount: -1 } : { paymentDate: -1 };

    // Fetch payments
    const payments = await Payment.find({ clientId })
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .select('amount paymentMethod paymentDate transactionId status')
      .lean();

    const totalCount = await Payment.countDocuments({ clientId });

    res.status(200).json({
      success: true,
      message: 'Payments fetched successfully',
      data: {
        payments: payments.map(pay => ({
          id: pay._id,
          amount: parseFloat((pay.amount || 0).toFixed(2)),
          paymentMethod: pay.paymentMethod,
          paymentDate: pay.paymentDate,
          transactionId: pay.transactionId,
          status: pay.status
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// ========== 4.1: CLIENT PROFILE ==========
/**
 * Get Client Profile
 * GET /api/client/profile
 */
export const getClientProfile = async (req, res) => {
  try {
    const clientId = req.client._id;

    const client = await Client.findById(clientId)
      .populate('userId', 'firstName lastName businessName email phone address')
      .select('-password')
      .lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const vendor = client.userId;

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        vendorInfo: {
          businessName: vendor?.businessName || 'N/A',
          contactName: `${vendor?.firstName || ''} ${vendor?.lastName || ''}`.trim(),
          email: vendor?.email,
          phone: vendor?.phone,
          address: vendor?.address
        },
        personalInfo: {
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone
        },
        companyInfo: {
          companyName: client.companyName,
          gstNumber: client.gstNumber,
          preferredPaymentMethod: client.preferredPaymentMethod
        },
        address: {
          street: client.address?.street || 'N/A',
          city: client.address?.city || 'N/A',
          state: client.address?.state || 'N/A',
          zipCode: client.address?.zipCode || 'N/A'
        },
        paymentStats: {
          totalInvoices: client.paymentStats.totalInvoices,
          totalAmount: parseFloat((client.paymentStats.totalAmount || 0).toFixed(2)),
          totalPaid: parseFloat((client.paymentStats.totalPaid || 0).toFixed(2)),
          paymentReliabilityScore: client.paymentStats.paymentReliabilityScore
        },
        accountInfo: {
          status: client.status,
          riskLevel: client.riskLevel,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};