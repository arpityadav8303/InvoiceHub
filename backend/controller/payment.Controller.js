import Payment from '../models/payment.model.js'
import Invoice from '../models/invoice.model.js'
import Client from '../models/client.model.js'
import User from '../models/user.model.js'
import { generateInvoicePDF, deletePDF } from '../services/pdfService.js'
import { generatePaymentConfirmationEmailSmart } from '../services/llmService.js'
import { sendEmail } from '../services/emailService.js'

const recordPayment = async (req, res) => {
  let pdfPath = null;
  try {
    const {
      invoiceId,
      amount,
      paymentMethod,
      paymentDate = new Date(),
      referenceNumber,
      bankDetails,
      transactionId,
      notes
    } = req.body;

    // Ensure paymentDate is a Date object
    const paymentDateObj = new Date(paymentDate);

    // Step 1: Find invoice (FIXED: Use findById instead of findOne)
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice already fully paid' });
    }

    // Step 2: Validate amount
    const remainingToPay = invoice.total - invoice.paidAmount;
    if (amount > (remainingToPay + 0.01)) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds balance of $${remainingToPay.toFixed(2)}`
      });
    }

    // Step 3: Fetch client and user
    const client = await Client.findById(invoice.clientId);
    const user = await User.findById(invoice.userId);

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'Business owner not found' });
    }

    // Step 4: Create Payment Record (FIXED: No req.user since this is public)
    const newPayment = await Payment.create({
      userId: invoice.userId, // Use invoice owner's userId, not client
      invoiceId,
      clientId: invoice.clientId,
      amount,
      paymentMethod,
      paymentDate: paymentDateObj,
      referenceNumber,
      bankDetails,
      transactionId,
      notes
    });

    // Step 5: Update Invoice
    invoice.paidAmount += amount;
    invoice.calculateStatus(); // sets draft/sent/partially_paid/paid
    invoice.paymentHistory.push({
      amount,
      paymentDate: paymentDateObj,
      paymentMethod,
      transactionId,
      referenceNumber
    });
    await invoice.save();

    // Step 6: Update Client Stats
    const isOnTime = paymentDateObj <= new Date(invoice.dueDate);
    const daysOverdue = isOnTime
      ? 0
      : Math.ceil((paymentDateObj - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24));

    await Client.findByIdAndUpdate(invoice.clientId, {
      $inc: {
        'paymentStats.totalPaid': amount,
        'paymentStats.totalUnpaid': -amount,
        [isOnTime ? 'paymentStats.onTimePayments' : 'paymentStats.latePayments']: 1
      },
      $set: { 'paymentStats.lastPaymentDate': paymentDateObj }
    });

    const updatedClient = await Client.findById(invoice.clientId);

    // Calculate reliability score
    const totalPayments =
      updatedClient.paymentStats.onTimePayments + updatedClient.paymentStats.latePayments;
    const newReliabilityScore =
      totalPayments > 0
        ? Math.round(
          (updatedClient.paymentStats.onTimePayments / totalPayments) * 100
        )
        : 0;

    // Step 7: Send Response FIRST (Optimization for UI timeout)
    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: {
        _id: newPayment._id,
        invoiceId: newPayment.invoiceId,
        clientId: newPayment.clientId,
        amount: newPayment.amount,
        paymentMethod: newPayment.paymentMethod,
        paymentDate: newPayment.paymentDate,
        referenceNumber: newPayment.referenceNumber,
        transactionId: newPayment.transactionId,
        status: newPayment.status,
        isOnTime,
        daysOverdue
      },
      invoice: {
        status: invoice.status,
        paidAt: paymentDateObj
      },
      clientStats: {
        totalPaid: updatedClient.paymentStats.totalPaid,
        totalUnpaid: updatedClient.paymentStats.totalUnpaid,
        paymentReliabilityScore: newReliabilityScore,
        onTimePayments: updatedClient.paymentStats.onTimePayments,
        latePayments: updatedClient.paymentStats.latePayments
      },
      email: {
        sent: 'processing',
        to: client.email,
        note: 'Payment confirmation email will be sent in the background'
      }
    });

    // Step 8: Send Email in Background (Non-blocking)
    (async () => {
      try {
        console.log('📧 Generating payment confirmation email and PDF (Background Job)...');
        const pdfPath = await generateInvoicePDF(invoice, client, user, newPayment);
        console.log(`✅ PDF generated at: ${pdfPath}`);

        const emailContent = await generatePaymentConfirmationEmailSmart(
          newPayment,
          invoice,
          client,
          user
        );

        const emailAttachments = [
          {
            filename: `Invoice_${invoice.invoiceNumber}.pdf`,
            path: pdfPath
          }
        ];

        await sendEmail(
          client.email,
          emailContent.subject,
          emailContent.body_html,
          emailAttachments
        );

        console.log(`✅ Payment confirmation email sent to ${client.email}`);

        // Cleanup PDF
        if (pdfPath) {
          try {
            const deleted = await deletePDF(pdfPath);
            if (deleted) {
              console.log(`✅ Temporary PDF successfully cleaned up: ${pdfPath}`);
            }
          } catch (cleanupError) {
            console.error(`⚠️ Failed to cleanup PDF: ${cleanupError.message}`);
          }
        }
      } catch (backgroundError) {
        console.error(`⚠️ Background Email Error: ${backgroundError.message}`);
        // Consider logging to a dedicated error monitoring service here
      }
    })();

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100); // Cap at 100

    const skip = (page - 1) * limit;
    let query = { userId: req.user._id };

    // Validate status
    if (req.query.status && ['completed', 'pending', 'failed'].includes(req.query.status)) {
      query.status = req.query.status;
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('invoiceId', 'invoiceNumber total dueDate status') // Added more fields
        .lean(),
      Payment.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Payments fetched successfully',
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

const getPaymentsById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Payment fetched successfully',
      payment: payment
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    })
  }
}

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate payment exists and belongs to user
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // 2. Get associated Invoice and Client
    const invoice = await Invoice.findById(payment.invoiceId);
    const client = await Client.findById(payment.clientId);

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    // 3. Revert Invoice financial data
    const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
    const newRemainingAmount = invoice.total - newPaidAmount;

    // 4. Recalculate Invoice Status dynamically
    let newStatus = 'sent';
    if (newPaidAmount > 0) {
      newStatus = 'partially_paid';
    } else if (newPaidAmount >= invoice.total) {
      newStatus = 'paid';
    }

    // 5. Update Invoice: Remove from history and update balance/status
    await Invoice.findByIdAndUpdate(payment.invoiceId, {
      status: newStatus,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      // If no money is left, clear payment fields
      paidAt: newPaidAmount === 0 ? null : invoice.paidAt,
      paymentMethod: newPaidAmount === 0 ? null : invoice.paymentMethod,
      $pull: {
        paymentHistory: { transactionId: payment.transactionId }
      }
    });

    // 6. Revert Client Stats
    const wasOnTime = new Date(payment.paymentDate) <= new Date(invoice.dueDate);
    const clientUpdate = {
      $inc: {
        'paymentStats.totalPaid': -payment.amount,
        'paymentStats.totalUnpaid': payment.amount,
        [wasOnTime ? 'paymentStats.onTimePayments' : 'paymentStats.latePayments']: -1
      }
    };

    await Client.findByIdAndUpdate(payment.clientId, clientUpdate);

    // 7. Recalculate reliability score
    const updatedClient = await Client.findById(payment.clientId);
    const newReliabilityScore = updatedClient.calculateReliabilityScore();
    await Client.findByIdAndUpdate(payment.clientId, {
      'paymentStats.paymentReliabilityScore': newReliabilityScore
    });

    // 8. Delete the payment record
    await Payment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted and invoice updated successfully',
      data: {
        newStatus,
        remainingAmount: newRemainingAmount,
        totalPaid: newPaidAmount
      }
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


export { recordPayment, getPayments, getPaymentsById, deletePayment }