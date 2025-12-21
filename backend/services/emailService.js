import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export async function sendEmail(to, subject, htmlBody, attachments = []) {
    const apiKey = process.env.EMAIL_PASSWORD;

    if (!apiKey) {
        throw new Error('EMAIL_PASSWORD (API Key) not found in .env');
    }

    // Convert local paths to Base64 objects for Brevo
    const formattedAttachments = attachments.map(file => {
        if (file.path && fs.existsSync(file.path)) {
            const content = fs.readFileSync(file.path).toString('base64');
            return {
                content: content,
                name: file.filename
            };
        }
        return null;
    }).filter(Boolean);

    const payload = {
        sender: {
            name: process.env.BUSINESS_NAME || 'InvoiceHub',
            email: process.env.EMAIL_SENDER
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlBody,
        // Brevo uses 'attachment' (singular) for the array of objects
        attachment: formattedAttachments 
    };

    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Email sent to ${to} with ${formattedAttachments.length} attachment(s)`);
        return { success: true, messageId: response.data.messageId };
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`❌ Email Service Error:`, errorMsg);
        throw new Error(`Failed to send email: ${errorMsg}`);
    }
}

// import nodemailer from 'nodemailer';
// import axios from 'axios';
// import dotenv from 'dotenv';

// dotenv.config();

// // ============================================
// // SOLUTION 1: BREVO REST API (RECOMMENDED)
// // ============================================
// export async function sendEmailViaBrevoAPI(to, subject, htmlBody, attachments = []) {
//     const apiKey = process.env.EMAIL_PASSWORD;

//     if (!apiKey) {
//         throw new Error('EMAIL_PASSWORD (API Key) not found in .env');
//     }

//     const payload = {
//         sender: {
//             name: process.env.BUSINESS_NAME || 'InvoiceHub',
//             email: process.env.EMAIL_SENDER
//         },
//         to: [{ email: to }],
//         subject: subject,
//         htmlContent: htmlBody
//     };

//     try {
//         const response = await axios.post(
//             'https://api.brevo.com/v3/smtp/email',
//             payload,
//             {
//                 headers: {
//                     'api-key': apiKey,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         console.log(`✅ Email sent via Brevo REST API to ${to}`);
//         console.log(`   Message ID: ${response.data.messageId}`);
//         return { success: true, messageId: response.data.messageId };
//     } catch (error) {
//         console.error(`❌ Failed to send email via Brevo API to ${to}`);
//         console.error('Error:', error.response?.data?.message || error.message);
//         throw new Error(`Failed to send email: ${error.response?.data?.message || error.message}`);
//     }
// }

// // ============================================
// // SOLUTION 2: SMTP RELAY (Fallback)
// // ============================================
// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: parseInt(process.env.EMAIL_PORT) || 587,
//     secure: false, // TLS
//     auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// export async function sendTransactionEmail(to, subject, htmlBody, attachments = []) {
//     const mailOptions = {
//         from: `"${process.env.BUSINESS_NAME || 'InvoiceHub'}" <${process.env.EMAIL_SENDER}>`,
//         to: to,
//         subject: subject,
//         html: htmlBody,
//         attachments: attachments,
//     };

//     try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log(`✅ Email sent via SMTP to ${to}. Message ID: ${info.messageId}`);
//         return { success: true, messageId: info.messageId };
//     } catch (error) {
//         console.error(`❌ SMTP Email error for ${to}:`, error.message);
//         throw new Error(`Failed to send email: ${error.message}`);
//     }
// }

// // ============================================
// // TEST EMAIL CONNECTION
// // ============================================
// export async function testEmailConnection() {
//     try {
//         await transporter.verify();
//         console.log("✅ SMTP connection verified!");
//         return true;
//     } catch (error) {
//         console.error("❌ SMTP connection failed:", error.message);
//         return false;
//     }
// }

// // ============================================
// // TEST BREVO REST API CONNECTION
// // ============================================
// export async function testBrevoAPIConnection() {
//     const apiKey = process.env.EMAIL_PASSWORD;

//     if (!apiKey) {
//         console.log("❌ No API key found in EMAIL_PASSWORD");
//         return false;
//     }

//     try {
//         const response = await axios.get('https://api.brevo.com/v3/account', {
//             headers: {
//                 'api-key': apiKey,
//                 'Content-Type': 'application/json'
//             }
//         });

//         console.log("✅ Brevo REST API Connection Successful!");
//         console.log(`   Account Email: ${response.data.email}`);
//         console.log(`   Plan: ${response.data.plan}`);
//         return true;
//     } catch (error) {
//         console.error("❌ Brevo REST API Connection Failed!");
//         console.error(`   Status: ${error.response?.status}`);
//         console.error(`   Error: ${error.response?.data?.message || error.message}`);
//         return false;
//     }
// }

// // ============================================
// // AUTO-SELECT BEST METHOD
// // ============================================
// export async function sendEmail(to, subject, htmlBody, attachments = []) {
//     console.log(`\n📧 Attempting to send email to ${to}...`);

//     // Try REST API first (more reliable)
//     try {
//         console.log("   Trying Brevo REST API...");
//         return await sendEmailViaBrevoAPI(to, subject, htmlBody, attachments);
//     } catch (restError) {
//         console.log("   REST API failed, trying SMTP...");

//         try {
//             return await sendTransactionEmail(to, subject, htmlBody, attachments);
//         } catch (smtpError) {
//             console.error("   Both methods failed!");
//             throw new Error(`Email send failed: ${smtpError.message}`);
//         }
//     }
// }

