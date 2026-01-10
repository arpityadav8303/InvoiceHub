import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testEmailDelivery() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          EMAIL DELIVERY TEST - POST VERIFICATION           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    const testEmail = 'ay982938@gmail.com'; // Your test email
    const payload = {
        sender: {
            name: process.env.BUSINESS_NAME || 'InvoiceHub',
            email: process.env.EMAIL_SENDER
        },
        to: [{ email: testEmail }],
        subject: '✅ Email Delivery Test - InvoiceHub',
        htmlContent: `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                        
                        <div style="text-align: center; padding-bottom: 20px; border-bottom: 3px solid #667eea;">
                            <h1 style="color: #667eea; margin: 0; font-size: 32px;">✅ Email Delivery Successful!</h1>
                            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Your email system is working correctly</p>
                        </div>

                        <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-left: 4px solid #667eea; border-radius: 5px;">
                            <h2 style="color: #667eea; margin-top: 0;">Test Details</h2>
                            <p><strong>✓ Sender Email:</strong> ${process.env.EMAIL_SENDER}</p>
                            <p><strong>✓ Recipient:</strong> ${testEmail}</p>
                            <p><strong>✓ Sent At:</strong> ${new Date().toLocaleString()}</p>
                            <p><strong>✓ Status:</strong> <span style="color: #22c55e; font-weight: bold;">DELIVERED</span></p>
                        </div>

                        <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 5px; border-left: 4px solid #22c55e;">
                            <h3 style="color: #22c55e; margin-top: 0;">What's Next?</h3>
                            <ol style="color: #333;">
                                <li>Your email system is <strong>fully operational</strong></li>
                                <li>Payment reminders will now be delivered correctly</li>
                                <li>All automated emails are working</li>
                                <li>You can start sending invoices to clients</li>
                            </ol>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://app.brevo.com/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                View Brevo Dashboard
                            </a>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                        <p style="text-align: center; color: #999; font-size: 12px;">
                            InvoiceHub © 2024 | Professional Invoice Management<br>
                            <a href="https://invoicehub.com" style="color: #667eea; text-decoration: none;">www.invoicehub.com</a>
                        </p>
                    </div>
                </body>
            </html>
        `
    };

    try {
        console.log('📤 Sending test email...\n');
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': process.env.EMAIL_PASSWORD,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Email sent successfully!\n');
        console.log('📧 Details:');
        console.log(`   From: ${process.env.EMAIL_SENDER}`);
        console.log(`   Amount: ₹${invoice.total}`);
        console.log(`   Message ID: ${response.data.messageId}`);
        console.log(`   Time: ${new Date().toLocaleString()}\n`);

        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                   CHECK YOUR EMAIL NOW!                    ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        console.log('📬 Check these locations:');
        console.log('   1. Inbox - ay982938@gmail.com');
        console.log('   2. Spam/Junk folder');
        console.log('   3. Promotions tab (if using Gmail)\n');

        console.log('✨ If you received the email:');
        console.log('   ✅ Your email system is fully operational!');
        console.log('   ✅ Payment reminders will work correctly');
        console.log('   ✅ All invoice emails will be delivered\n');

        console.log('❌ If you did NOT receive the email:');
        console.log('   1. Wait 2-3 minutes (emails may be delayed)');
        console.log('   2. Refresh your email');
        console.log('   3. Check spam folder again');
        console.log('   4. Try with a different email address\n');

    } catch (error) {
        console.log('❌ Error sending email:');
        console.log(`   ${error.response?.data?.message || error.message}\n`);
    }
}

testEmailDelivery().catch(console.error);