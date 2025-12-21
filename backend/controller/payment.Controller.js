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
    const { invoiceId, amount, paymentMethod, paymentDate = new Date(), referenceNumber, bankDetails, transactionId, notes } = req.body

    // Step 1: Validate invoice exists
    const invoice = await Invoice.findById(invoiceId)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    // Step 2: Verify invoice belongs to logged-in user
    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to record payment for this invoice'
      })
    }

    // Step 3: Check if invoice is already paid
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This invoice is already paid'
      })
    }

    // Step 4: Validate payment amount doesn't exceed invoice total
    if (amount > invoice.total) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed invoice total of ${invoice.total}`
      })
    }

    // Step 5: Get client details
    const client = await Client.findById(invoice.clientId)

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      })
    }

    // Step 5.5: Get user (business) details - ADDED FOR EMAIL/PDF
    const user = await User.findById(invoice.userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Step 6: Check if payment is on-time or late
    const paymentDateObj = new Date(paymentDate)
    const dueDateObj = new Date(invoice.dueDate)
    const isOnTime = paymentDateObj <= dueDateObj
    const daysOverdue = isOnTime ? 0 : Math.ceil((paymentDateObj - dueDateObj) / (1000 * 60 * 60 * 24))

    // Step 7: Create payment record
    const newPayment = await Payment.create({
      userId: req.user._id,
      invoiceId: invoiceId,
      clientId: invoice.clientId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentDate: paymentDateObj,
      referenceNumber: referenceNumber,
      bankDetails: bankDetails,
      transactionId: transactionId,
      notes: notes,
      status: 'completed'
    })

    // Step 8: Update invoice status to "paid"
    await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        status: 'paid',
        paidAt: paymentDateObj,
        paymentMethod: paymentMethod
      }
    )

    // Step 9: Update client payment stats
    const updateData = {
      $inc: {
        'paymentStats.totalPaid': amount,
        'paymentStats.totalUnpaid': -amount
      }
    }

    // If payment is on-time, increment onTimePayments, otherwise increment latePayments
    if (isOnTime) {
      updateData.$inc['paymentStats.onTimePayments'] = 1
    } else {
      updateData.$inc['paymentStats.latePayments'] = 1
    }

    // Step 10: Update client's last payment date
    updateData['paymentStats.lastPaymentDate'] = paymentDateObj

    await Client.findByIdAndUpdate(invoice.clientId, updateData)

    // Step 11: Recalculate client's payment reliability score
    const updatedClient = await Client.findById(invoice.clientId)
    const newReliabilityScore = updatedClient.calculateReliabilityScore()

    await Client.findByIdAndUpdate(
      invoice.clientId,
      {
        'paymentStats.paymentReliabilityScore': newReliabilityScore
      }
    )

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
    const { id } = req.params

    // Step 1: Validate payment exists
    const payment = await Payment.findById(id)

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      })
    }

    // Step 2: Verify payment belongs to logged-in user
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this payment'
      })
    }

    // Step 3: Get invoice details before deletion
    const invoice = await Invoice.findById(payment.invoiceId)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Associated invoice not found'
      })
    }

    // Step 4: Get client details
    const client = await Client.findById(payment.clientId)

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Associated client not found'
      })
    }

    // Step 5: Check if payment is on-time or late (for reverting stats)
    const paymentDateObj = new Date(payment.paymentDate)
    const dueDateObj = new Date(invoice.dueDate)
    const wasOnTime = paymentDateObj <= dueDateObj

    // Step 6: Delete the payment record
    await Payment.findByIdAndDelete(id)

    // Step 7: Revert invoice status back to sent/draft (not paid)
    await Invoice.findByIdAndUpdate(
      payment.invoiceId,
      {
        status: 'sent',
        paidAt: null,
        paymentMethod: null
      }
    )

    // Step 8: Revert client payment stats
    const updateData = {
      $inc: {
        'paymentStats.totalPaid': -payment.amount,
        'paymentStats.totalUnpaid': payment.amount
      }
    }

    // Revert on-time or late payment count
    if (wasOnTime) {
      updateData.$inc['paymentStats.onTimePayments'] = -1
    } else {
      updateData.$inc['paymentStats.latePayments'] = -1
    }

    await Client.findByIdAndUpdate(payment.clientId, updateData)

    // Step 9: Recalculate client's payment reliability score
    const updatedClient = await Client.findById(payment.clientId)
    const newReliabilityScore = updatedClient.calculateReliabilityScore()

    await Client.findByIdAndUpdate(
      payment.clientId,
      {
        'paymentStats.paymentReliabilityScore': newReliabilityScore
      }
    )

    // Step 10: Return success response
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      data: {
        deletedPaymentId: id,
        invoiceId: payment.invoiceId,
        clientId: payment.clientId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod
      },
      updatedInvoice: {
        status: 'sent',
        paidAt: null
      },
      updatedClientStats: {
        totalPaid: updatedClient.paymentStats.totalPaid - payment.amount,
        totalUnpaid: updatedClient.paymentStats.totalUnpaid + payment.amount,
        paymentReliabilityScore: newReliabilityScore,
        onTimePayments: wasOnTime ? updatedClient.paymentStats.onTimePayments - 1 : updatedClient.paymentStats.onTimePayments,
        latePayments: wasOnTime ? updatedClient.paymentStats.latePayments : updatedClient.paymentStats.latePayments - 1
      }
    })
  } catch (error) {
    console.error('Delete payment error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message
    })
  }
}

export { recordPayment, getPayments, getPaymentsById, deletePayment }