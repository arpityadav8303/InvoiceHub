import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use flash model (cheaper)

/**
 * Generate a professional payment reminder email using Google Gemini AI
 * @param {Object} invoice - Invoice object with invoiceNumber, total, dueDate
 * @param {Object} client - Client object with firstName, lastName, email
 * @returns {Object} - { subject: string, body_html: string }
 */
export const generateClientReminder = async (invoice, client) => {
  const prompt = `Generate a payment reminder email. Return ONLY valid JSON.

Client: ${client.firstName} ${client.lastName}
Invoice: ${invoice.invoiceNumber}
Amount: $${invoice.total}
Due: ${invoice.dueDate}

Return JSON with "subject" and "body_html" keys:
{"subject":"...","body_html":"<html>...</html>"}`;

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