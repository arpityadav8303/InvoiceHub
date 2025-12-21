import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a professional invoice PDF
 * @param {Object} invoice - Invoice document from DB
 * @param {Object} client - Client document from DB
 * @param {Object} user - User (company) document from DB
 * @param {Object} payment - Payment document from DB
 * @returns {string} - Path to generated PDF
 */
export const generateInvoicePDF = (invoice, client, user, payment) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF directory if it doesn't exist
      const pdfDir = path.join(__dirname, '../generated-pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const pdfFileName = `Invoice_${invoice.invoiceNumber}_${timestamp}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Pipe to file
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // ==================== HEADER ====================
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#007bff');
      doc.text('InvoiceHub', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#666');
      doc.text('Your Professional Invoice Management Partner', 50, 82);

      // Horizontal line
      doc.moveTo(50, 100).lineTo(550, 100).stroke('#e0e0e0');

      // ==================== COMPANY INFO ====================
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text('FROM:', 50, 120);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(user.businessName || 'InvoiceHub', 50, 140);
      doc.text(`${user.firstName} ${user.lastName}`, 50, 158);
      
      if (user.address) {
        if (user.address.street) doc.text(`${user.address.street}`, 50, 176);
        if (user.address.city) doc.text(`${user.address.city}, ${user.address.state} ${user.address.zipCode}`, 50, 194);
      }
      
      doc.text(`Email: ${user.email}`, 50, 212);
      doc.text(`Phone: ${user.phone}`, 50, 230);

      // ==================== CLIENT INFO ====================
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text('BILL TO:', 320, 120);
      
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(`${client.firstName} ${client.lastName}`, 320, 140);
      if (client.companyName) doc.text(client.companyName, 320, 158);
      
      if (client.address) {
        if (client.address.street) doc.text(`${client.address.street}`, 320, 176);
        if (client.address.city) doc.text(`${client.address.city}, ${client.address.state} ${client.address.zipCode}`, 320, 194);
      }
      
      doc.text(`Email: ${client.email}`, 320, 212);
      doc.text(`Phone: ${client.phone}`, 320, 230);

      // ==================== INVOICE DETAILS ====================
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
      doc.text('INVOICE DETAILS', 50, 270);

      const detailsY = 290;
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, detailsY);
      doc.text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 50, detailsY + 18);
      doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 50, detailsY + 36);
      doc.text(`Payment Terms: ${invoice.paymentTerms}`, 50, detailsY + 54);

      if (invoice.status === 'paid') {
        doc.fillColor('#28a745');
        doc.text(`Status: PAID`, 50, detailsY + 72);
        if (payment && payment.paymentDate) {
          doc.fillColor('#666');
          doc.text(`Payment Date: ${formatDate(payment.paymentDate)}`, 50, detailsY + 90);
        }
      }

      // ==================== LINE ITEMS TABLE ====================
      const tableTop = 450;
      const col1 = 50;
      const col2 = 280;
      const col3 = 400;
      const col4 = 480;

      // Header
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
      doc.rect(col1, tableTop, 500, 30).fill('#007bff');
      doc.text('Description', col1 + 10, tableTop + 8);
      doc.text('Qty', col2 + 10, tableTop + 8);
      doc.text('Rate', col3 + 10, tableTop + 8);
      doc.text('Amount', col4 + 10, tableTop + 8);

      // Rows
      let rowY = tableTop + 35;
      doc.fontSize(9).font('Helvetica').fillColor('#333');

      invoice.items.forEach((item) => {
        doc.text(item.description.substring(0, 30), col1 + 10, rowY);
        doc.text(item.quantity.toString(), col2 + 10, rowY);
        doc.text(`$${item.rate.toFixed(2)}`, col3 + 10, rowY);
        doc.text(`$${item.amount.toFixed(2)}`, col4 + 10, rowY);
        rowY += 25;
      });

      // Summary Section
      const summaryY = rowY + 20;
      doc.fontSize(10).font('Helvetica').fillColor('#333');

      // Subtotal
      doc.text('Subtotal:', 350, summaryY);
      doc.text(`$${invoice.subtotal.toFixed(2)}`, 450, summaryY, { align: 'right' });

      // Discount
      if (invoice.discount > 0) {
        doc.text('Discount:', 350, summaryY + 20);
        doc.text(`-$${invoice.discount.toFixed(2)}`, 450, summaryY + 20, { align: 'right' });
      }

      // Tax
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(`Tax (${invoice.taxRate}%):`, 350, summaryY + 40);
      doc.text(`$${invoice.tax.toFixed(2)}`, 450, summaryY + 40, { align: 'right' });

      // Total
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#007bff');
      doc.text('TOTAL:', 350, summaryY + 65);
      doc.text(`$${invoice.total.toFixed(2)}`, 450, summaryY + 65, { align: 'right' });

      // ==================== PAYMENT INFO ====================
      if (payment) {
        const paymentY = summaryY + 110;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
        doc.text('PAYMENT INFORMATION', 50, paymentY);

        doc.fontSize(9).font('Helvetica').fillColor('#666');
        doc.text(`Payment Method: ${formatPaymentMethod(payment.paymentMethod)}`, 50, paymentY + 20);
        doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`, 50, paymentY + 38);
        doc.text(`Payment Date: ${formatDate(payment.paymentDate)}`, 50, paymentY + 56);

        if (payment.transactionId) {
          doc.text(`Transaction ID: ${payment.transactionId}`, 50, paymentY + 74);
        }
        if (payment.referenceNumber) {
          doc.text(`Reference: ${payment.referenceNumber}`, 50, paymentY + 92);
        }
      }

      // ==================== NOTES ====================
      if (invoice.notes) {
        const notesY = 650;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
        doc.text('Notes:', 50, notesY);
        doc.fontSize(9).font('Helvetica').fillColor('#666');
        doc.text(invoice.notes, 50, notesY + 20, {
          width: 500,
          align: 'left'
        });
      }

      // ==================== FOOTER ====================
      doc.fontSize(8).font('Helvetica').fillColor('#999');
      doc.text('Thank you for your business!', 50, 750, { align: 'center' });
      doc.text('InvoiceHub - Professional Invoice Management | www.invoicehub.com | support@invoicehub.com', 50, 765, { align: 'center' });

      // Finish PDF
      doc.end();

      // Resolve when file is written
      stream.on('finish', () => {
        console.log(`✅ PDF generated: ${pdfFileName}`);
        resolve(pdfPath);
      });

      stream.on('error', (err) => {
        reject(new Error(`Failed to write PDF: ${err.message}`));
      });

    } catch (error) {
      reject(new Error(`PDF generation error: ${error.message}`));
    }
  });
};

/**
 * Format date to readable string
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Format payment method for display
 */
function formatPaymentMethod(method) {
  const methods = {
    'bank_transfer': 'Bank Transfer',
    'cheque': 'Cheque',
    'upi': 'UPI',
    'card': 'Credit/Debit Card',
    'cash': 'Cash'
  };
  return methods[method] || method;
}

/**
 * Delete PDF file
 */
export const deletePDF = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ PDF deleted: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to delete PDF: ${error.message}`);
  }
  return false;
};