import Invoice from '../models/invoice.model.js'
import Client from '../models/client.model.js'

const createInvoice =async(req,res)=>{
    try {
        console.log('req.user:', req.user)
        const {clientId,invoiceNumber,dueDate,items, discount = 0, taxRate = 18, paymentTerms = 'Net 30', notes }=req.body
        console.log("Looking for clientId:", clientId);
        const client = await Client.findById(clientId)
        console.log("Client found:", client);

      if (!client) {
          return res.status(404).json({
              success: false,
              message: 'Client not found'
            })
        }

        if (client.userId.toString() !== req.user._id.toString()) {
         return res.status(403).json({
           success: false,
           message: 'Not authorized to create invoice for this client'
          });
        }   
      const existingInvoice = await Invoice.findOne({ userId: req.user._id, invoiceNumber })
      if (existingInvoice) {
           return res.status(400).json({
             success: false,
             message: 'Invoice number already exists'
            })
        }
      const calculatedItems = items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate
        }))

        const newInvoice = new Invoice({
          userId: req.user._id,
          clientId: clientId,
          invoiceNumber: invoiceNumber,
          invoiceDate: new Date(),
          dueDate: dueDate,
          items: calculatedItems,
          discount: discount,
          taxRate: taxRate,
          paymentTerms: paymentTerms,
          notes: notes,
          status: 'draft'
        })
        newInvoice.calculateTotals()

      await newInvoice.save()

       await Client.findByIdAndUpdate(
      clientId,
      {
        $inc: {
          'paymentStats.totalInvoices': 1,
          'paymentStats.totalAmount': newInvoice.total,
          'paymentStats.totalUnpaid': newInvoice.total
        },
        'paymentStats.lastInvoiceDate': new Date()
      }
     )

     res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: newInvoice
     })



    }
    catch (error) {
    console.error('Create invoice error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    })
  }
}


const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit
    const status = req.query.status

    let query = { userId: req.user._id }

    if (status && ['draft', 'sent', 'paid', 'overdue'].includes(status)) {
      query.status = status
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'firstName lastName email companyName')

    const totalInvoices = await Invoice.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Invoices fetched successfully',
      invoices: invoices,
      totalCount: totalInvoices,
      currentPage: page,
      totalPages: Math.ceil(totalInvoices / limit)
    })
  } catch (error) {
    console.error('Get invoices error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    })
  }
}

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findById(id)
      .populate('clientId', 'firstName lastName email phone companyName address')
      .populate('userId', 'firstName lastName email businessName')

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    if (invoice.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this invoice'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Invoice fetched successfully',
      invoice: invoice
    })
  } catch (error) {
    console.error('Get invoice by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    })
  }
}

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params
    const { clientId, invoiceNumber, dueDate, items, discount, taxRate, paymentTerms, notes, status } = req.body

    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this invoice'
      })
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid invoice'
      })
    }

    if (clientId && clientId !== invoice.clientId.toString()) {
      const client = await Client.findById(clientId)
      if (!client || client.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Client not found or not authorized'
        })
      }
      invoice.clientId = clientId
    }

    if (invoiceNumber && invoiceNumber !== invoice.invoiceNumber) {
      const existingInvoice = await Invoice.findOne({ userId: req.user._id, invoiceNumber })
      if (existingInvoice) {
        return res.status(400).json({
          success: false,
          message: 'Invoice number already exists'
        })
      }
      invoice.invoiceNumber = invoiceNumber
    }

    if (dueDate) invoice.dueDate = dueDate
    if (paymentTerms) invoice.paymentTerms = paymentTerms
    if (notes !== undefined) invoice.notes = notes
    if (status && ['draft', 'sent', 'paid', 'overdue'].includes(status)) invoice.status = status

    if (items) {
      const calculatedItems = items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))
      invoice.items = calculatedItems
    }

    if (discount !== undefined) invoice.discount = discount
    if (taxRate !== undefined) invoice.taxRate = taxRate

    invoice.calculateTotals()

    await invoice.save()

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: invoice
    })
  } catch (error) {
    console.error('Update invoice error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    })
  }
}

// DELETE INVOICE
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params

    const invoice = await Invoice.findById(id)

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      })
    }

    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this invoice'
      })
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a paid invoice'
      })
    }

    await Client.findByIdAndUpdate(
      invoice.clientId,
      {
        $inc: {
          'paymentStats.totalInvoices': -1,
          'paymentStats.totalAmount': -invoice.total,
          'paymentStats.totalUnpaid': -invoice.total
        }
      }
    )

    await Invoice.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Delete invoice error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    })
  }
}


export {createInvoice,getInvoices,getInvoiceById,updateInvoice,deleteInvoice}