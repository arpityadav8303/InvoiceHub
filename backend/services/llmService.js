import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use flash model (cheaper)

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

}
`;


  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    
    // Parse JSON
    const emailContent = JSON.parse(cleanText);
    
    // Validate required fields
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
 * Fallback: Generate email template without AI (when quota exceeded)
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
            <p>Due Date: <strong>${invoice.dueDate}</strong></p>
          </div>
          
          <p>Please arrange payment at your earliest convenience. If you have already made this payment, please disregard this notice.</p>
          
          <p>If you have any questions or need an invoice copy, feel free to reach out.</p>
          
          <p>Thank you for your business!</p>
          
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
    console.warn("⚠️  AI generation failed, using fallback template...");
    return generateClientReminderFallback(invoice, client);
  }
};

/**
 * Generate a custom message using Gemini
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