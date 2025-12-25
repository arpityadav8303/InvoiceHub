import mongoose from 'mongoose'

const paymentReminderSchema = new mongoose.Schema(
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
    
    reminderNumber: {
      type: Number,
      default: 1
    },
    
    reminderType: {
      type: String,
      enum: ['auto', 'manual', 'scheduled'],
      default: 'manual'
    },
    
    subject: {
      type: String,
      required: true
    },
    
    messageBody: {
      type: String,
      required: true
    },
    
    messageType: {
      type: String,
      enum: ['friendly', 'firm', 'urgent'],
      default: 'friendly'
    },
    
    isLLMGenerated: {
      type: Boolean,
      default: false
    },
    
    daysOverdueAtTime: {
      type: Number,
      default: 0
    },
    
    sentAt: Date,
    
    sentVia: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      default: 'email'
    },
    
    deliveryStatus: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending'
    },
    
    deliveryError: String,
    
    emailOpenedAt: Date,
    
    clientResponded: {
      type: Boolean,
      default: false
    },
    
    responseMessage: String,
    
    responseDate: Date,
    
    scheduledFor: Date,
    
    retryCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

paymentReminderSchema.index({ userId: 1, invoiceId: 1 })
paymentReminderSchema.index({ userId: 1, createdAt: -1 })
paymentReminderSchema.index({ userId: 1, sentAt: -1 })
paymentReminderSchema.index({ invoiceId: 1, sentAt: -1 })
paymentReminderSchema.index({ scheduledFor: 1 })

paymentReminderSchema.methods.markAsSent = function(sentDate = new Date()) {
  this.sentAt = sentDate
  this.deliveryStatus = 'sent'
  return this
}

paymentReminderSchema.methods.markAsFailed = function(error = 'Unknown error') {
  this.deliveryStatus = 'failed'
  this.deliveryError = error
  this.retryCount += 1
  return this
}

paymentReminderSchema.methods.markAsOpened = function(openedDate = new Date()) {
  this.emailOpenedAt = openedDate
  return this
}

paymentReminderSchema.methods.recordResponse = function(message, responseDate = new Date()) {
  this.clientResponded = true
  this.responseMessage = message
  this.responseDate = responseDate
  return this
}

paymentReminderSchema.methods.getReminderSummary = function() {
  return {
    reminderNumber: this.reminderNumber,
    type: this.messageType,
    sent: this.sentAt,
    deliveryStatus: this.deliveryStatus,
    opened: this.emailOpenedAt ? true : false,
    clientResponded: this.clientResponded
  }
}

const PaymentReminder = mongoose.model('PaymentReminder', paymentReminderSchema)

module.exports = PaymentReminder