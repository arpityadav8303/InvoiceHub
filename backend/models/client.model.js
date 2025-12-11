import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    firstName: {
      type: String,
      required: true
    },
    
    lastName: {
      type: String,
      required: true
    },
    
    email: {
      type: String,
      required: true
    },
    
    phone: {
      type: String,
      required: true
    },
    
    companyName: {
      type: String
    },
    
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    
    gstNumber: String,
    
    preferredPaymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'upi', 'card'],
      default: 'bank_transfer'
    },
    
    paymentStats: {
      totalInvoices: {
        type: Number,
        default: 0
      },
      totalAmount: {
        type: Number,
        default: 0
      },
      totalPaid: {
        type: Number,
        default: 0
      },
      totalUnpaid: {
        type: Number,
        default: 0
      },
      averageDaysToPayment: {
        type: Number,
        default: 0
      },
      paymentReliabilityScore: {
        type: Number,
        default: 0
      },
      onTimePayments: {
        type: Number,
        default: 0
      },
      latePayments: {
        type: Number,
        default: 0
      },
      lastPaymentDate: Date,
      lastInvoiceDate: Date
    },
    
    notes: String,
    
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW'
    },
    
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

clientSchema.index({ userId: 1, email: 1 })
clientSchema.index({ userId: 1, createdAt: -1 })

clientSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`
}

clientSchema.methods.calculateReliabilityScore = function() {
  if (this.paymentStats.totalInvoices === 0) return 0
  
  const onTimePercentage = (this.paymentStats.onTimePayments / this.paymentStats.totalInvoices) * 100
  
  return Math.round(onTimePercentage)
}

export default mongoose.model('Client', clientSchema)