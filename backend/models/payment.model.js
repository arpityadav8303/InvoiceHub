import mongoose from 'mongoose';

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
      min: 0.01 // Ensures a positive transaction
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
    referenceNumber: {
      type: String,
      trim: true
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String
    },
    transactionId: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed'], // Specific to the transaction lifecycle
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
);

// Indexed for faster performance on dashboard and reports
paymentSchema.index({ userId: 1, invoiceId: 1 });
paymentSchema.index({ userId: 1, paymentDate: -1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ invoiceId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;