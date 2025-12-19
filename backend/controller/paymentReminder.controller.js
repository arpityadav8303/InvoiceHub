import Invoice from '../models/invoice.model.js';
import Client from '../models/client.model.js';
import { sendEmail } from '../services/emailService.js';
import { generateClientReminderSmart } from '../services/llmService.js';

/**
 * Send payment reminder email for a specific invoice
 * POST /api/payment-reminder/:invoiceId
 */
export const sendPaymentReminder = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Validate invoice exists and belongs to user
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send reminder for this invoice'
      });
    }

    // Get client details
    const client = await Client.findById(invoice.clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Generate email content (with fallback to template)
    const emailContent = await generateClientReminderSmart(invoice, client);

    // Send email
    await sendEmail(
      client.email,
      emailContent.subject,
      emailContent.body_html
    );

    // Update invoice emailSentAt timestamp
    invoice.emailSentAt = new Date();
    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment reminder sent successfully',
      data: {
        invoiceId: invoice._id,
        clientEmail: client.email,
        clientName: `${client.firstName} ${client.lastName}`,
        emailSentAt: invoice.emailSentAt,
        subject: emailContent.subject
      }
    });

  } catch (error) {
    console.error('Send payment reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending payment reminder',
      error: error.message
    });
  }
};

/**
 * Send payment reminders to multiple overdue invoices
 * POST /api/payment-reminder/batch/send-overdue
 */
export const sendOverdueReminders = async (req, res) => {
  try {
    // Find all overdue invoices for this user that aren't paid
    const today = new Date();
    const overdueInvoices = await Invoice.find({
      userId: req.user._id,
      status: { $in: ['sent', 'overdue'] },
      dueDate: { $lt: today }
    }).populate('clientId');

    if (overdueInvoices.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No overdue invoices to remind',
        reminders_sent: 0
      });
    }

    const results = [];
    const errors = [];

    // Send reminders for each overdue invoice
    for (const invoice of overdueInvoices) {
      try {
        const client = invoice.clientId;
        const emailContent = await generateClientReminderSmart(invoice, client);

        await sendEmail(
          client.email,
          emailContent.subject,
          emailContent.body_html
        );

        invoice.emailSentAt = new Date();
        invoice.status = 'overdue';
        await invoice.save();

        results.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: client.email,
          clientName: `${client.firstName} ${client.lastName}`,
          status: 'sent'
        });
      } catch (error) {
        errors.push({
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Sent ${results.length} reminders${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      reminders_sent: results.length,
      reminders_failed: errors.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending batch reminders',
      error: error.message
    });
  }
};

/**
 * Send custom email to client
 * POST /api/payment-reminder/custom
 */
export const sendCustomEmail = async (req, res) => {
  try {
    const { clientId, subject, htmlBody } = req.body;

    if (!clientId || !subject || !htmlBody) {
      return res.status(400).json({
        success: false,
        message: 'clientId, subject, and htmlBody are required'
      });
    }

    // Verify client belongs to user
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (client.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to email this client'
      });
    }

    // Send email
    const result = await sendEmail(client.email, subject, htmlBody);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        clientEmail: client.email,
        clientName: `${client.firstName} ${client.lastName}`,
        messageId: result.messageId
      }
    });

  } catch (error) {
    console.error('Custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
};