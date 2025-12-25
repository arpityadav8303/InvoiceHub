import Invoice from '../models/invoice.model.js';
import Client from '../models/client.model.js';
import { sendEmail, sendEmailReminder} from '../services/emailService.js';
import { generateClientReminderSmart, generatePaymentConfirmationEmailSmart } from '../services/llmService.js';

/**
 * Send payment reminder for a specific invoice
 */
export const sendPaymentReminder = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Validate invoice exists
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: "Invoice not found" 
      });
    }

    // Check authorization
    if (invoice.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    // Get client details
    const client = await Client.findById(invoice.clientId);
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: "Client not found" 
      });
    }

    console.log("📨 Reminder request:", { invoiceId, clientEmail: client.email });

    // Generate AI payment reminder email using LLM
    console.log("🤖 Generating AI reminder email...");
    const emailContent = await generateClientReminderSmart(invoice, client);

    // Send email
    console.log("📧 Sending reminder email...");
    const emailResult = await sendEmailReminder(
      client.email,
      emailContent.subject,
      emailContent.body_html
    );

    console.log("✅ Email sent:", emailResult.messageId);

    // Update invoice with email sent timestamp
    invoice.emailSentAt = new Date();
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Payment reminder sent successfully",
      data: {
        invoiceId: invoice._id,
        clientEmail: client.email,
        clientName: `${client.firstName} ${client.lastName}`,
        emailSentAt: invoice.emailSentAt,
        subject: emailContent.subject,
      },
    });
  } catch (error) {
    console.error("❌ Send payment reminder error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending payment reminder",
      error: error.message,
    });
  }
};

/**
 * Send batch payment reminders for all overdue invoices
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

    console.log(`📨 Sending ${overdueInvoices.length} batch reminders...`);

    const results = [];
    const errors = [];

    // Send reminders for each overdue invoice
    for (const invoice of overdueInvoices) {
      try {
        const client = invoice.clientId;
        console.log(`🤖 Generating reminder for ${client.email}...`);
        
        const emailContent = await generateClientReminderSmart(invoice, client);

        console.log(`📧 Sending to ${client.email}...`);
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

        console.log(`✅ Reminder sent to ${client.email}`);
      } catch (error) {
        console.error(`❌ Failed for invoice ${invoice.invoiceNumber}:`, error.message);
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
    console.error('❌ Batch reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending batch reminders',
      error: error.message
    });
  }
};

/**
 * Send custom email to a specific client
 */
export const sendCustomEmail = async (req, res) => {
  try {
    const { clientId, subject, htmlBody } = req.body;

    // Validation
    if (!clientId || !subject || !htmlBody) {
      return res.status(400).json({
        success: false,
        message: 'clientId, subject, and htmlBody are required'
      });
    }

    // Get client details
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check authorization - user can only send to their own clients
    if (client.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to email this client'
      });
    }

    console.log(`📧 Sending custom email to ${client.email}...`);

    // Send email
    const result = await sendEmail(client.email, subject, htmlBody);

    console.log(`✅ Custom email sent to ${client.email}`);

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
    console.error('❌ Custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
};

// Export all functions
