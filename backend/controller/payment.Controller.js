import Payment from '../models/payment.model.js'
import Invoice from '../models/invoice.model.js'
import Client from '../models/client.model.js'

const recordPayment = async (req, res) => {
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
      }
    })
  } catch (error) {
    console.error('Record payment error:', error)
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

export { recordPayment,getPayments }