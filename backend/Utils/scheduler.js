import cron from 'node-cron';
import Invoice from '../models/invoice.model.js';
import Client from '../models/client.model.js';
import { generateClientReminderSmart } from '../services/llmService.js';
import { sendEmail } from '../services/emailService.js';

const runAutomatedReminders = async () => {
  const startTime = new Date();
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🕒 AUTOMATED PAYMENT REMINDERS        ║');
  console.log('║     Time: ' + startTime.toLocaleTimeString() + '        ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    console.log(`📅 Looking for invoices due before: ${today.toDateString()}`);

    // Find all invoices that are overdue and not yet paid
    const overdueInvoices = await Invoice.find({
      status: { $in: ['sent', 'overdue'] },
      dueDate: { $lt: today }
    }).populate('clientId');

    console.log(`📊 Found ${overdueInvoices.length} overdue invoice(s)\n`);

    if (overdueInvoices.length === 0) {
      console.log('✅ No overdue invoices found. All caught up!\n');
      logSchedulerCompletion(startTime, 0, 0);
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];
    const errors = [];

    // Process each overdue invoice
    for (const invoice of overdueInvoices) {
      try {
        const client = invoice.clientId;
        
        // Validate client exists and has email
        if (!client || !client.email) {
          console.warn(`⚠️  Skipping Invoice ${invoice.invoiceNumber}: No valid client email`);
          failureCount++;
          errors.push({
            invoiceNumber: invoice.invoiceNumber,
            reason: 'No valid client email'
          });
          continue;
        }

        console.log(`📨 Processing Invoice: ${invoice.invoiceNumber}`);
        console.log(`   Client: ${client.firstName} ${client.lastName} (${client.email})`);
        console.log(`   Amount: $${invoice.total} | Days Overdue: ${invoice.getDaysOverdue()}`);

        // Generate AI-powered reminder email content
        console.log(`   🤖 Generating reminder email...`);
        const emailContent = await generateClientReminderSmart(invoice, client);

        if (!emailContent || !emailContent.subject || !emailContent.body_html) {
          throw new Error('Invalid email content generated');
        }

        // Send email via configured service (Brevo REST API)
        console.log(`   📧 Sending email...`);
        const emailResult = await sendEmail(
          client.email,
          emailContent.subject,
          emailContent.body_html
        );

        // Update invoice to track email sent
        invoice.emailSentAt = new Date();
        invoice.status = 'overdue'; // Ensure status is marked as overdue
        await invoice.save();

        successCount++;
        results.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: client.email,
          clientName: `${client.firstName} ${client.lastName}`,
          amount: invoice.total,
          daysOverdue: invoice.getDaysOverdue(),
          status: 'sent',
          messageId: emailResult.messageId,
          sentAt: invoice.emailSentAt
        });

        console.log(`   ✅ Reminder sent successfully!`);
        console.log(`   Message ID: ${emailResult.messageId}\n`);

      } catch (err) {
        failureCount++;
        const errorMsg = err.message || 'Unknown error';
        
        console.error(`   ❌ Failed to send reminder for Invoice ${invoice.invoiceNumber}`);
        console.error(`   Error: ${errorMsg}\n`);
        
        errors.push({
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientId?.email || 'N/A',
          error: errorMsg
        });
      }
    }

    // Log summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║          📊 SUMMARY                    ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`✅ Successfully sent: ${successCount} reminder(s)`);
    console.log(`❌ Failed: ${failureCount} reminder(s)`);
    console.log(`📈 Total processed: ${overdueInvoices.length} invoice(s)\n`);

    if (results.length > 0) {
      console.log('✅ SUCCESSFUL REMINDERS:');
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. Invoice: ${result.invoiceNumber}`);
        console.log(`      Client: ${result.clientName}`);
        console.log(`      Email: ${result.clientEmail}`);
        console.log(`      Amount: $${result.amount}`);
        console.log(`      Days Overdue: ${result.daysOverdue}`);
        console.log(`      Message ID: ${result.messageId}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ FAILED REMINDERS:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. Invoice: ${error.invoiceNumber}`);
        console.log(`      Reason: ${error.error || error.reason}`);
      });
    }

    logSchedulerCompletion(startTime, successCount, failureCount);

  } catch (error) {
    console.error('\n❌ SCHEDULER ERROR:', error.message);
    console.error('Stack:', error.stack);
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║     ❌ SCHEDULER EXECUTION FAILED      ║');
    console.log('╚════════════════════════════════════════╝\n');
  }
};


const logSchedulerCompletion = (startTime, successCount, failureCount) => {
  const endTime = new Date();
  const executionTime = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   ✅ SCHEDULER EXECUTION COMPLETED    ║');
  console.log('║   ' + endTime.toLocaleTimeString() + ' - ' + executionTime + 's        ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Log to file or external service if needed
  console.log(`📝 Execution Log Summary:`);
  console.log(`   Start: ${startTime.toLocaleTimeString()}`);
  console.log(`   End: ${endTime.toLocaleTimeString()}`);
  console.log(`   Duration: ${executionTime}s`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failureCount}`);
  console.log(`   Total: ${successCount + failureCount}\n`);
};


export const initScheduler = () => {
  try {
    const scheduledTime = '0 9 * * *'; // 9:00 AM every day
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   📅 PAYMENT REMINDER SCHEDULER       ║');
    console.log('║   Status: INITIALIZING...             ║');
    console.log('╚════════════════════════════════════════╝\n');

    const task = cron.schedule(scheduledTime, () => {
      runAutomatedReminders();
    });

    console.log('✅ Payment reminder scheduler initialized!');
    console.log(`⏰ Scheduled to run: Every day at 9:00 AM`);
    console.log(`📅 Cron Expression: "${scheduledTime}"`);
    console.log('💬 Description: Sends payment reminders for overdue invoices\n');
    console.log('Next execution will be at 09:00 AM tomorrow (or today if before 9 AM)\n');

    // Optional: Test by uncommenting to run immediately on startup
    // console.log('🧪 Running test reminder check...');
    // runAutomatedReminders();

    return task;

  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};


export const triggerRemindersManually = async () => {
  console.log('\n🧪 Manual reminder trigger initiated by user');
  await runAutomatedReminders();
};

export default { initScheduler, triggerRemindersManually };


