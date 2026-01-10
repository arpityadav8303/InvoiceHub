import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        rate: { type: Number, required: true, min: 0 },
        amount: { type: Number, required: true }
    }],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partially_paid', 'overdue'],
      default: 'draft'
    },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    paidAt: Date,
    paymentMethod: String,
    paymentHistory: [{
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String,
        referenceNumber: String
    }],
    paymentTerms: { type: String, default: 'Net 30' },
    notes: String,
    emailSentAt: Date
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, dueDate: 1 });
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ clientId: 1, status: 1 });

invoiceSchema.methods.updateStatusIfOverdue = function() {
  if (this.dueDate < new Date() && this.status !== 'paid' && this.status !== 'partially_paid') {
    this.status = 'overdue';
  }
  return this;
};

invoiceSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.tax = (this.subtotal * this.taxRate) / 100;
  this.total = this.subtotal - this.discount + this.tax;
  this.remainingAmount = this.total - this.paidAmount;
  return this.total;
};

invoiceSchema.methods.calculateStatus = function() {
  if (this.paidAmount <= 0) {
    this.status = 'sent';
  } else if (this.paidAmount < this.total) {
    this.status = 'partially_paid';
  } else {
    this.status = 'paid';
    this.paidAt = new Date();
  }
  this.remainingAmount = this.total - this.paidAmount;
  return this.status;
};
invoiceSchema.methods.getDaysOverdue = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  if (dueDate >= today) return 0; // Not overdue
  
  const diffTime = today - dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default mongoose.model('Invoice', invoiceSchema);