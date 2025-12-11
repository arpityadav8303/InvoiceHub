import mongoose from "mongoose"

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    
    invoiceNumber: {
      type: String,
      required: true
    },
    
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    
    dueDate: {
      type: Date,
      required: true
    },
    
    items: [
      {
        description: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        rate: {
          type: Number,
          required: true,
          min: 0
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],
    
    subtotal: {
      type: Number,
      default: 0
    },
    
    discount: {
      type: Number,
      default: 0
    },
    
    taxRate: {
      type: Number,
      default: 18
    },
    
    tax: {
      type: Number,
      default: 0
    },
    
    total: {
      type: Number,
      default: 0
    },
    
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft'
    },
    
    paymentTerms: {
      type: String,
      default: 'Net 30'
    },
    
    notes: String,
    
    emailSentAt: Date,
    
    paidAt: Date,
    
    paymentMethod: String
  },
  {
    timestamps: true
  }
)

invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ userId: 1, status: 1 })
invoiceSchema.index({ userId: 1, dueDate: 1 })
invoiceSchema.index({ userId: 1, clientId: 1 })

invoiceSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0)
  
  this.tax = (this.subtotal * this.taxRate) / 100
  
  this.total = this.subtotal - this.discount + this.tax
  
  return this.total
}

invoiceSchema.methods.markAsPaid = function(paymentDate = new Date()) {
  this.status = 'paid'
  this.paidAt = paymentDate
  return this
}

invoiceSchema.methods.markAsOverdue = function() {
  const now = new Date()
  if (this.dueDate < now && this.status !== 'paid') {
    this.status = 'overdue'
  }
  return this
}

invoiceSchema.methods.getDaysOverdue = function() {
  const now = new Date()
  const dueDate = new Date(this.dueDate)
  const diffTime = now - dueDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

const Invoice = mongoose.model('Invoice', invoiceSchema)

// module.exports = Invoice
export default Invoice