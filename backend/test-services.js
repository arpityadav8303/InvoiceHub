import dotenv from 'dotenv';
import { generateClientReminderSmart } from './services/llmService.js';
import { 
  sendEmail, 
  testEmailConnection, 
  testBrevoAPIConnection,
  sendEmailViaBrevoAPI 
} from './services/emailService.js';

dotenv.config();

async function runTest() {
    console.log("╔════════════════════════════════════════╗");
    console.log("║   EMAIL SERVICE INTEGRATION TEST       ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Environment check
    console.log("📋 Environment Variables:");
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || '❌ MISSING'}`);
    console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || '❌ MISSING'}`);
    console.log(`   EMAIL_USERNAME: ${process.env.EMAIL_USERNAME || '❌ MISSING'}`);
    console.log(`   EMAIL_SENDER: ${process.env.EMAIL_SENDER || '❌ MISSING'}`);
    console.log(`   API Key Present: ${process.env.EMAIL_PASSWORD ? '✅ YES' : '❌ NO'}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ YES' : '❌ NO'}\n`);

    // Test 1: SMTP Connection
    console.log("🔗 Test 1: Testing SMTP Connection...");
    const smtpOk = await testEmailConnection();

    // Test 2: REST API Connection
    console.log("\n🔗 Test 2: Testing Brevo REST API...");
    const apiOk = await testBrevoAPIConnection();

    // Determine which method to use
    const useAPI = apiOk;
    const method = useAPI ? "REST API" : "SMTP";
    
    if (!smtpOk && !apiOk) {
        console.log("\n❌ BOTH METHODS FAILED!");
        console.log("\nPlease check:");
        console.log("1. Your API key at: https://app.brevo.com/settings/keys/api");
        console.log("2. Sender email verified at: https://app.brevo.com/senders");
        console.log("3. Your .env file has correct values");
        return;
    }

    // Mock Data
    const mockInvoice = {
        invoiceNumber: "INV-TEST-001",
        total: 1500.50,
        dueDate: "2025-12-31"
    };

    const mockClient = {
        firstName: "Arpit",
        lastName: "Yadav",
        email: "arpityadav58571@gmail.com"
    };

    try {
        // Step 1: Generate email content
        console.log("\n🤖 Step 1: Generating email content...");
        const aiContent = await generateClientReminderSmart(mockInvoice, mockClient);
        console.log("✅ Email subject:", aiContent.subject);
        console.log("✅ Email body length:", aiContent.body_html?.length || 0, "characters\n");

        // Step 2: Send email
        console.log(`📧 Step 2: Sending email via ${method}...`);
        const emailResult = await sendEmail(
            mockClient.email,
            aiContent.subject,
            aiContent.body_html
        );

        if (emailResult.success) {
            console.log("\n╔════════════════════════════════════════╗");
            console.log("║           🎉 SUCCESS! 🎉              ║");
            console.log("╚════════════════════════════════════════╝");
            console.log(`\n✅ Email sent successfully to: ${mockClient.email}`);
            console.log(`✅ Message ID: ${emailResult.messageId}`);
            console.log(`✅ Method used: ${method}`);
            console.log("\nAll services working correctly!");
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
        console.error("\nDebugging steps:");
        console.error("1. Check your .env file for typos");
        console.error("2. Verify API key: https://app.brevo.com/settings/keys/api");
        console.error("3. Verify sender email: https://app.brevo.com/senders");
    }
}

runTest();