import mongoose from 'mongoose'



const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true
    },
    
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'card', 'upi', 'cash'],
      required: true
    },
    
    paymentDate: {
      type: Date,
      default: Date.now
    },
    
    referenceNumber: String,
    
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String
    },
    
    transactionId: String,
    
    notes: String,
    
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'],
      default: 'completed'
    },
    
    reconciled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

paymentSchema.index({ userId: 1, invoiceId: 1 })
paymentSchema.index({ userId: 1, paymentDate: -1 })
paymentSchema.index({ userId: 1, clientId: 1 })
paymentSchema.index({ invoiceId: 1 })

paymentSchema.methods.getPaymentDetails = function() {
  return {
    amount: this.amount,
    method: this.paymentMethod,
    date: this.paymentDate,
    reference: this.referenceNumber,
    status: this.status
  }
}

const Payment = mongoose.model('Payment', paymentSchema)

export default Payment