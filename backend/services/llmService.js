import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate a professional payment reminder email using Google Gemini AI
 * @param {Object} invoice - Invoice object with invoiceNumber, total, dueDate
 * @param {Object} client - Client object with firstName, lastName, email
 * @returns {Object} - { subject: string, body_html: string }
 */
export const generateClientReminder = async (invoice, client) => {
  const prompt = `
You are an expert email copywriter for InvoiceHub, a professional invoice management platform. 
Your task is to generate a sophisticated, branded payment reminder email that maintains professional standards while encouraging timely payment.

**CRITICAL: Return ONLY valid JSON with exactly two keys: "subject" and "body_html". No additional text, no markdown, no explanations.**

---

### BRAND IDENTITY:
- **Company Name:** InvoiceHub
- **Brand Color:** #007bff (Professional Blue)
- **Accent Color:** #28a745 (Success Green)
- **Secondary Color:** #f8f9fa (Light Gray Background)

---

### CLIENT & INVOICE DATA:
- Client Name: ${client.firstName} ${client.lastName}
- Client Email: ${client.email}
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${invoice.total}
- Due Date: ${invoice.dueDate}

---

### EMAIL REQUIREMENTS:

#### 1. SUBJECT LINE:
Format: "Payment Reminder: Invoice [NUMBER] - Payment Due on [DATE]"
Example: "Payment Reminder: Invoice INV-2024-001 - Due on December 25, 2024"

#### 2. PROFESSIONAL DESIGN:
- Clean, modern HTML with inline CSS
- Max width: 600px
- White background with subtle gray accents
- Professional typography and spacing
- Mobile-responsive layout

#### 3. HEADER:
- Company name "InvoiceHub" in prominent brand blue (#007bff)
- Tagline: "Your Professional Invoice Management Partner"
- Professional, not cartoonish

#### 4. GREETING:
- Personalized: "Dear ${client.firstName},"
- Warm and professional tone
- Acknowledge the business relationship

#### 5. INVOICE DETAILS SECTION:
Present in a card-style box with left border (#007bff):
- Invoice Number: ${invoice.invoiceNumber}
- Amount Due: $${invoice.total} (with currency formatting)
- Due Date: ${invoice.dueDate}
- Use table layout for clarity
- Include subtle background color (#f8f9fa)

#### 6. MAIN MESSAGE:
- Friendly reminder tone (professional, not urgent)
- Clear explanation of the payment request
- Brief, scannable paragraphs
- Positive, solution-focused language

#### 7. PAYMENT OPTIONS:
- List available payment methods professionally
- Make it easy to find payment options
- Include multiple methods for client convenience

#### 8. CALL-TO-ACTION:
- Include a prominent "Pay Now" button or link
- Use brand color (#007bff)
- Make it the focal point

#### 9. SUPPORT SECTION:
- "Questions or concerns?" message
- Contact information:
  - Email: support@invoicehub.com
  - Support Portal: https://invoicehub.com/support
- Professional and helpful tone

#### 10. CLOSING:
- Sign-off: "Best regards,"
- Company information:
  - InvoiceHub
  - Email: support@invoicehub.com
  - Website: www.invoicehub.com
- Professional footer

#### 11. DESIGN SPECIFICATIONS:
- **Colors:** White background, #333 text, #007bff links/accents, #f8f9fa boxes
- **Fonts:** Arial, Helvetica, sans-serif
- **Headings:** 24-28px, bold, #007bff
- **Body text:** 14-16px, #333, line-height: 1.6
- **Spacing:** 20-30px padding, clear sections
- **Icons:** Use Unicode emojis professionally (📄, 💰, ✅, ⚠️)

#### 12. TONE:
- Professional and courteous
- Solution-oriented, not threatening
- Acknowledge client importance
- Encourage communication
- Use "we" language for partnership

---

### CRITICAL OUTPUT FORMAT:
{
  "subject": "Payment Reminder: Invoice ${invoice.invoiceNumber} - Due on ${invoice.dueDate}",
  "body_html": "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body style='font-family: Arial, Helvetica, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;'><div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px;'><!-- Content here --></div></body></html>"
}

**RULES:**
1. Return ONLY valid JSON - no extra text
2. Escape all special characters properly
3. Keep HTML valid and responsive
4. Inline styles only
5. Include all required sections
6. Professional InvoiceHub branding
7. Clear call-to-action
8. Mobile-friendly design
9. Personalized with provided data
10. Professional tone throughout

Generate the complete email now following all specifications above.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    const emailContent = JSON.parse(cleanText);
    
    if (!emailContent.subject || !emailContent.body_html) {
      throw new Error("AI response missing required fields");
    }
    
    return emailContent;
  } catch (error) {
    console.error("LLM Error:", error.message);
    throw new Error(`Failed to generate email content: ${error.message}`);
  }
};

/**
 * Generate a professional payment confirmation email using Gemini AI
 * @param {Object} payment - Payment object with paymentDate, amount, paymentMethod, transactionId
 * @param {Object} invoice - Invoice object with invoiceNumber, total, dueDate, invoiceDate, items
 * @param {Object} client - Client object with firstName, lastName, email, companyName
 * @param {Object} user - User/Company object with businessName, email, phone, address
 * @returns {Object} - { subject: string, body_html: string }
 */
export const generatePaymentConfirmationEmail = async (payment, invoice, client, user) => {
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format items list
  const itemsList = invoice.items.map(item => 
    `${item.description} (Qty: ${item.quantity}, Rate: $${item.rate.toFixed(2)}, Amount: $${item.amount.toFixed(2)})`
  ).join('\n');

  const prompt = `
You are an expert email copywriter for InvoiceHub, a professional invoice management platform.
Your task is to generate a professional, branded payment confirmation email that delights the client and reinforces a positive business relationship.

**CRITICAL: Return ONLY valid JSON with exactly two keys: "subject" and "body_html". No additional text, no markdown, no explanations.**

---

### BRAND IDENTITY:
- **Company Name:** InvoiceHub
- **Brand Color:** #007bff (Professional Blue)
- **Success Color:** #28a745 (Green)
- **Secondary Color:** #f8f9fa (Light Gray Background)

---

### PAYMENT & INVOICE DATA:
**From (Company):**
- Company Name: ${user.businessName || 'InvoiceHub'}
- Company Email: ${user.email}
- Company Phone: ${user.phone}
${user.address ? `- Company Address: ${user.address.street || ''} ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}` : ''}

**To (Client):**
- Client Name: ${client.firstName} ${client.lastName}
- Client Email: ${client.email}
- Client Company: ${client.companyName || 'N/A'}

**Invoice Details:**
- Invoice Number: ${invoice.invoiceNumber}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}
- Subtotal: $${invoice.subtotal.toFixed(2)}
- Discount: $${invoice.discount.toFixed(2)}
- Tax Rate: ${invoice.taxRate}%
- Tax Amount: $${invoice.tax.toFixed(2)}
- Total Amount: $${invoice.total.toFixed(2)}

**Payment Details:**
- Payment Amount: $${payment.amount.toFixed(2)}
- Payment Date: ${paymentDate}
- Payment Method: ${payment.paymentMethod}
${payment.transactionId ? `- Transaction ID: ${payment.transactionId}` : ''}
${payment.referenceNumber ? `- Reference Number: ${payment.referenceNumber}` : ''}

**Invoice Items:**
${itemsList}

---

### EMAIL REQUIREMENTS:

#### 1. SUBJECT LINE:
Format: "Payment Confirmation - Invoice [NUMBER]"
Example: "Payment Confirmation - Invoice INV-2024-001"

#### 2. STRUCTURE:
- Header with checkmark (✓) and "Payment Received"
- Warm greeting
- Success badge/confirmation message
- Invoice details in card
- Invoice summary (subtotal, tax, total)
- Payment details section
- Thank you message
- Next steps/what happens now
- Call-to-action button
- Support information
- Professional footer

#### 3. DESIGN SPECIFICATIONS:
- **Max Width:** 650px
- **Header:** Gradient blue background (#007bff to #0056b3), white text
- **Success Badge:** Green (#28a745) background with white text
- **Details Box:** Light gray (#f8f9fa) background with blue left border
- **Colors:** Professional blue (#007bff), success green (#28a745)
- **Font:** Arial, Helvetica, sans-serif
- **Responsive:** Mobile-friendly layout
- **Icons:** Use professional unicode emojis (✓, 💳, 📄, ⚠️)

#### 4. CONTENT SECTIONS:

**A. HEADER:**
- Large checkmark (✓)
- "Payment Received" heading
- Subheading: "Your payment has been successfully processed"

**B. GREETING:**
- Personalized: "Dear ${client.firstName} ${client.lastName},"
- Professional and warm tone

**C. CONFIRMATION MESSAGE:**
- Celebrate successful payment
- Mention invoice is now marked as paid
- Professional but friendly tone

**D. INVOICE DETAILS:**
- Invoice Number
- Invoice Date
- Original Due Date
- Invoice Status (PAID)
- Display in card with subtle styling

**E. INVOICE SUMMARY:**
- Subtotal amount
- Discount (if any)
- Tax rate and amount
- Total amount in prominent styling

**F. PAYMENT DETAILS SECTION:**
- Payment Method (formatted nicely)
- Amount Paid
- Payment Date
- Transaction ID (if available)
- Reference Number (if available)
- Use green accent for success

**G. NEXT STEPS:**
- Invoice PDF attached to email
- Payment confirmation saved
- Can download anytime from dashboard
- Use checkmarks for each point

**H. CALL-TO-ACTION:**
- "View Invoice in Dashboard" button
- Use brand blue (#007bff)
- Make it prominent

**I. SUPPORT:**
- "Questions?" message
- Contact email: support@invoicehub.com
- Support portal link

**J. FOOTER:**
- Company information
- Website and links
- Copyright notice
- Professional signature

#### 5. TONE & STYLE:
- Professional yet warm
- Celebratory (payment received!)
- Clear and concise
- Solution-oriented
- Grateful for the payment
- Reinforce business relationship
- Positive language
- No threatening or urgent language

#### 6. IMPORTANT NOTES:
- Escape all special characters in JSON
- Keep HTML valid and properly formatted
- Inline styles only (no external CSS)
- Use table layouts for payment details
- Make buttons clickable
- Include proper meta tags for mobile
- Test readability on mobile devices

---

### CRITICAL OUTPUT FORMAT:
{
  "subject": "Payment Confirmation - Invoice ${invoice.invoiceNumber}",
  "body_html": "<complete-html-email-here>"
}

**RULES:**
1. Return ONLY valid JSON
2. No markdown, no backticks, no extra text
3. Proper HTML structure
4. All special characters escaped
5. Inline CSS only
6. Mobile-responsive
7. Professional design
8. Personalized content
9. Clear call-to-action
10. Thank you message

Generate the complete professional payment confirmation email now.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    const emailContent = JSON.parse(cleanText);
    
    if (!emailContent.subject || !emailContent.body_html) {
      throw new Error("AI response missing required fields (subject or body_html)");
    }
    
    return emailContent;
  } catch (error) {
    console.error("LLM Payment Email Error:", error.message);
    throw new Error(`Failed to generate payment confirmation email: ${error.message}`);
  }
};

/**
 * Fallback: Generate payment confirmation template without AI
 */
export const generatePaymentConfirmationFallback = (payment, invoice, client, user) => {
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    subject: `Payment Confirmation - Invoice ${invoice.invoiceNumber}`,
    body_html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px;">
              <h1 style="margin: 0; font-size: 32px;">✓ Payment Received</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your payment has been successfully processed</p>
            </div>

            <h2>Dear ${client.firstName} ${client.lastName},</h2>
            
            <p>We're delighted to confirm that your payment has been successfully received and processed.</p>

            <div style="background-color: #28a745; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: 600;">
              ✓ PAYMENT CONFIRMED
            </div>

            <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #007bff;">Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">PAID</span></p>
            </div>

            <div style="background-color: #f0f7ff; border: 2px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #007bff;">Invoice Summary</h3>
              <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
              ${invoice.discount > 0 ? `<p><strong>Discount:</strong> -$${invoice.discount.toFixed(2)}</p>` : ''}
              <p><strong>Tax (${invoice.taxRate}%):</strong> $${invoice.tax.toFixed(2)}</p>
              <p style="font-size: 18px; font-weight: 700; color: #007bff; border-top: 2px solid #007bff; padding-top: 10px; margin-top: 10px;">
                <strong>Total Paid:</strong> $${invoice.total.toFixed(2)}
              </p>
            </div>

            <div style="background-color: #e7f5e9; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #28a745;">💳 Payment Details</h3>
              <p><strong>Payment Method:</strong> ${payment.paymentMethod.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Amount Paid:</strong> <span style="font-weight: 600;">$${payment.amount.toFixed(2)}</span></p>
              <p><strong>Payment Date:</strong> ${paymentDate}</p>
              ${payment.transactionId ? `<p><strong>Transaction ID:</strong> ${payment.transactionId}</p>` : ''}
              ${payment.referenceNumber ? `<p><strong>Reference:</strong> ${payment.referenceNumber}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://invoicehub.com'}/dashboard/invoices" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block;">
                View Invoice in Dashboard
              </a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
              Thank you for your business! If you have any questions, please contact us at <a href="mailto:support@invoicehub.com" style="color: #007bff;">support@invoicehub.com</a>
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

            <div style="text-align: center; font-size: 12px; color: #666;">
              <p><strong>${user.businessName || 'InvoiceHub'}</strong></p>
              ${user.phone ? `<p>${user.phone}</p>` : ''}
              ${user.email ? `<p><a href="mailto:${user.email}" style="color: #007bff; text-decoration: none;">${user.email}</a></p>` : ''}
              <p style="margin-top: 20px;">© 2024 InvoiceHub. All rights reserved.</p>
            </div>

          </div>
        </body>
      </html>
    `
  };
};

/**
 * Smart payment confirmation email: Try AI first, fallback to template
 */
export const generatePaymentConfirmationEmailSmart = async (payment, invoice, client, user) => {
  try {
    return await generatePaymentConfirmationEmail(payment, invoice, client, user);
  } catch (error) {
    console.warn("⚠️ AI payment email generation failed, using fallback template...", error.message);
    return generatePaymentConfirmationFallback(payment, invoice, client, user);
  }
};

/**
 * Fallback: Generate reminder template without AI
 */
export const generateClientReminderFallback = (invoice, client) => {
  return {
    subject: `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
    body_html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2>Payment Reminder</h2>
          <p>Dear ${client.firstName} ${client.lastName},</p>
          
          <p>We hope you're doing well. This is a friendly reminder about your outstanding invoice.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p><strong>Invoice Details:</strong></p>
            <p>Invoice Number: <strong>${invoice.invoiceNumber}</strong></p>
            <p>Amount Due: <strong>$${invoice.total}</strong></p>
            <p>Due Date: <strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong></p>
          </div>
          
          <p>Please arrange payment at your earliest convenience. If you have already made this payment, please disregard this notice.</p>
          
          <p>If you have any questions, feel free to reach out.</p>
          
          <p>Best regards,<br>${process.env.BUSINESS_NAME || 'InvoiceHub'}</p>
        </body>
      </html>
    `
  };
};

/**
 * Smart function: Try AI first, fallback to template
 */
export const generateClientReminderSmart = async (invoice, client) => {
  try {
    return await generateClientReminder(invoice, client);
  } catch (error) {
    console.warn("⚠️ AI generation failed, using fallback template...");
    return generateClientReminderFallback(invoice, client);
  }
};

/**
 * Generate generic content using Gemini
 */
export const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("LLM Generation Error:", error.message);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
};