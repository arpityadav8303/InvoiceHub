import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'card', 'upi', 'cash'],
      required: true
    },
    paymentDate: { type: Date, default: Date.now },
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
    }
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);