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
    const { invoiceId, amount, paymentMethod, paymentDate = new Date(), referenceNumber, bankDetails, transactionId, notes } = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (invoice.status === 'paid') return res.status(400).json({ success: false, message: 'Invoice already fully paid' });

    const remainingToPay = invoice.total - invoice.paidAmount;
    if (amount > (remainingToPay + 0.01)) { // Added small buffer for float precision
      return res.status(400).json({ success: false, message: `Amount exceeds balance of $${remainingToPay.toFixed(2)}` });
    }

    const client = await Client.findById(invoice.clientId);
    const user = await User.findById(invoice.userId);

    // Create Payment Record
    const newPayment = await Payment.create({
      userId: req.user._id,
      invoiceId,
      clientId: invoice.clientId,
      amount,
      paymentMethod,
      paymentDate,
      referenceNumber,
      bankDetails,
      transactionId,
      notes
    });

    // Update Invoice
    invoice.paidAmount += amount;
    invoice.calculateStatus(); // Uses the logic: partially_paid vs paid
    invoice.paymentHistory.push({
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      referenceNumber
    });
    await invoice.save();

    // Update Client Stats
    const isLate = new Date(paymentDate) > new Date(invoice.dueDate);
    await Client.findByIdAndUpdate(invoice.clientId, {
      $inc: {
        'paymentStats.totalPaid': amount,
        'paymentStats.totalUnpaid': -amount,
        [isLate ? 'paymentStats.latePayments' : 'paymentStats.onTimePayments']: 1
      },
      $set: { 'paymentStats.lastPaymentDate': paymentDate }
    });

    // ========== STEP 11.5: SEND PAYMENT CONFIRMATION EMAIL WITH PDF ==========
    try {
  console.log('📧 Generating payment confirmation email and PDF...');

  // Ensure this returns a STRING path, not a Promise object
  pdfPath = await generateInvoicePDF(invoice, client, user, newPayment);
  console.log(`✅ PDF generated at: ${pdfPath}`);

  const emailContent = await generatePaymentConfirmationEmailSmart(newPayment, invoice, client, user);

  const emailAttachments = [
    {
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      path: pdfPath
    }
  ];

  // Await the email sending process
  const emailResult = await sendEmail(
    client.email,
    emailContent.subject,
    emailContent.body_html,
    emailAttachments
  );

  console.log(`✅ Payment confirmation email sent to ${client.email}`);

} catch (emailError) {
  console.error(`⚠️ Failed to send payment confirmation email: ${emailError.message}`);
} finally {
  // CRITICAL FIX: Ensure the file is actually deleted
  if (pdfPath) {
    try {
      // Use await to ensure the file system operation finishes
      const deleted = await deletePDF(pdfPath); 
      if (deleted) {
        console.log(`✅ Temporary PDF successfully cleaned up: ${pdfPath}`);
      }
    } catch (cleanupError) {
      console.error(`⚠️ Failed to cleanup PDF: ${cleanupError.message}`);
    }
  }
}
    // Step 12: Return success response
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
        isOnTime: isOnTime,
        daysOverdue: daysOverdue
      },
      invoice: {
        status: 'paid',
        paidAt: paymentDateObj
      },
      clientStats: {
        totalPaid: updatedClient.paymentStats.totalPaid + amount,
        totalUnpaid: updatedClient.paymentStats.totalUnpaid - amount,
        paymentReliabilityScore: newReliabilityScore,
        onTimePayments: isOnTime ? updatedClient.paymentStats.onTimePayments + 1 : updatedClient.paymentStats.onTimePayments,
        latePayments: isOnTime ? updatedClient.paymentStats.latePayments : updatedClient.paymentStats.latePayments + 1
      },
      email: {
        sent: true,
        to: client.email,
        note: 'Payment confirmation email with invoice PDF has been sent to the client'
      }
    })

  } catch (error) {
    console.error('Record payment error:', error)
    
    // Cleanup PDF if error occurs
    if (pdfPath) {
      try {
        await deletePDF(pdfPath)
      } catch (cleanupError) {
        console.error(`Failed to cleanup PDF on error: ${cleanupError.message}`)
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    })
  }
}


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