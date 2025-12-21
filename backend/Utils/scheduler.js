import cron from 'node-cron';
import Invoice from '../models/invoice.model.js';
import { generateClientReminderSmart } from '../services/llmService.js';
import { sendEmail } from '../services/emailService.js';

const runAutomatedReminders = async () => {
  console.log("🕒 Running scheduled payment reminders...");
  try {
    const today = new Date();
    
    // Find all invoices that are overdue and not yet paid
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'overdue'] },
      dueDate: { $lt: today }
    }).populate('clientId');

    if (overdueInvoices.length === 0) {
      console.log("✅ No overdue invoices found today.");
      return;
    }

    for (const invoice of overdueInvoices) {
      try {
        const client = invoice.clientId;
        if (!client || !client.email) continue;

        // Generate AI-powered content (falls back to template if AI fails)
        const emailContent = await generateClientReminderSmart(invoice, client);

        // Send email via configured service (Brevo/SMTP)
        await sendEmail(
          client.email,
          emailContent.subject,
          emailContent.body_html
        );

        // Update invoice status
        invoice.emailSentAt = new Date();
        invoice.status = 'overdue';
        await invoice.save();
        
        console.log(`✅ Reminder sent to ${client.email} for Invoice ${invoice.invoiceNumber}`);
      } catch (err) {
        console.error(`❌ Failed to send reminder for Invoice ${invoice.invoiceNumber}:`, err.message);
      }
    }
  } catch (error) {
    console.error("❌ Scheduler Error:", error.message);
  }
};

// Schedule to run every day at 9:00 AM
export const initScheduler = () => {
  cron.schedule('0 9 * * *', () => {
    runAutomatedReminders();
  });
  console.log("📅 Payment reminder scheduler initialized (Daily at 9 AM)");
};


