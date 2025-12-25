import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = (invoice, client, user, payment) => {
  // Dynamically set currency symbol
  const currency = user.preferences?.invoiceCurrency === 'INR' ? '₹' : '$';

  return new Promise((resolve, reject) => {
    try {
      const pdfDir = path.resolve(__dirname, '../generated-pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const pdfFileName = `Invoice_${invoice.invoiceNumber}_${Date.now()}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFileName);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // --- Colors & Styling ---
      const primaryColor = '#1e293b';
      const secondaryColor = '#3b82f6';
      const accentColor = '#64748b';
      const successColor = '#166534';
      const tableHeaderBg = '#f8fafc';

      // ==================== HEADER SECTION ====================
      doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor)
        .text(user.businessName?.toUpperCase() || 'INVOICEHUB', 50, 45);

      doc.fontSize(20).font('Helvetica-Bold').fillColor(secondaryColor)
        .text('INVOICE', 400, 45, { align: 'right' });

      if (invoice.status === 'paid') {
        doc.rect(480, 75, 65, 18).fill('#dcfce7');
        doc.fontSize(9).font('Helvetica-Bold').fillColor(successColor)
          .text('PAID', 480, 80, { width: 65, align: 'center' });
      }

      doc.moveTo(50, 110).lineTo(550, 110).stroke('#e2e8f0');

      let metaY = 125;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor)
        .text('INVOICE NUMBER', 50, metaY);
      doc.text('DATE OF ISSUE', 180, metaY);
      doc.text('DUE DATE', 310, metaY);

      doc.fontSize(10).font('Helvetica').fillColor(primaryColor)
        .text(invoice.invoiceNumber, 50, metaY + 15);
      doc.text(formatDate(invoice.invoiceDate), 180, metaY + 15);
      doc.text(formatDate(invoice.dueDate), 310, metaY + 15);

      // ==================== BILLING DETAILS ====================
      let billingY = 180;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text('FROM', 50, billingY);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
        .text(user.businessName || 'InvoiceHub', 50, billingY + 15);
      doc.fontSize(10).font('Helvetica').fillColor(primaryColor)
        .text(`${user.firstName} ${user.lastName}`, 50, billingY + 30)
        .text(user.email, 50, billingY + 45)
        .text(user.phone || '', 50, billingY + 60);

      doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text('BILL TO', 320, billingY);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor)
        .text(`${client.firstName} ${client.lastName}`, 320, billingY + 15);
      doc.fontSize(10).font('Helvetica').fillColor(primaryColor);
      if (client.companyName) doc.text(client.companyName, 320, billingY + 30);
      doc.text(client.email, 320, billingY + 45)
        .text(client.phone || '', 320, billingY + 60);

      // ==================== LINE ITEMS TABLE ====================
      const tableTop = 280;
      doc.rect(50, tableTop, 500, 25).fill(tableHeaderBg);

      doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor);
      doc.text('DESCRIPTION', 60, tableTop + 8);
      doc.text('QTY', 300, tableTop + 8);
      doc.text('PRICE', 380, tableTop + 8);
      doc.text('TOTAL', 480, tableTop + 8, { align: 'right' });

      let rowY = tableTop + 35;
      doc.font('Helvetica').fontSize(10).fillColor(primaryColor);

      invoice.items.forEach((item) => {
        doc.moveTo(50, rowY + 15).lineTo(550, rowY + 15).lineWidth(0.5).stroke('#f1f5f9');
        doc.text(item.description, 60, rowY);
        doc.text(item.quantity.toString(), 300, rowY);
        doc.text(`${currency}${item.rate.toFixed(2)}`, 380, rowY);
        doc.text(`${currency}${item.amount.toFixed(2)}`, 480, rowY, { align: 'right' });
        rowY += 25;
      });

      // ==================== SUMMARY SECTION ====================
      let summaryY = rowY + 20;
      const summaryLeft = 350;

      doc.fontSize(10).font('Helvetica').fillColor(accentColor).text('Subtotal', summaryLeft, summaryY);
      doc.fillColor(primaryColor).text(`${currency}${invoice.subtotal.toFixed(2)}`, 450, summaryY, { align: 'right' });

      doc.fillColor(accentColor).text(`Tax (${invoice.taxRate}%)`, summaryLeft, summaryY + 20);
      doc.fillColor(primaryColor).text(`${currency}${invoice.tax.toFixed(2)}`, 450, summaryY + 20, { align: 'right' });

      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('Invoice Total', summaryLeft, summaryY + 40);
      doc.text(`${currency}${invoice.total.toFixed(2)}`, 450, summaryY + 40, { align: 'right' });

      doc.fontSize(10).font('Helvetica-Bold').fillColor(successColor).text('Amount Paid (Current)', summaryLeft, summaryY + 60);
      doc.text(`${currency}${payment.amount.toFixed(2)}`, 450, summaryY + 60, { align: 'right' });

      const balanceDue = invoice.remainingAmount;
      const boxColor = balanceDue <= 0 ? successColor : '#ef4444';

      doc.rect(summaryLeft - 10, summaryY + 80, 210, 40).fill(boxColor);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff').text('BALANCE DUE', summaryLeft, summaryY + 93);
      doc.text(`${currency}${balanceDue.toFixed(2)}`, 450, summaryY + 93, { align: 'right' });

      // ==================== NOTES & FOOTER ====================
      if (invoice.notes) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor(accentColor).text('NOTES', 50, 650);
        doc.fontSize(9).font('Helvetica').fillColor(primaryColor).text(invoice.notes, 50, 665, { width: 250 });
      }

      doc.fontSize(8).font('Helvetica').fillColor(accentColor)
        .text('Thank you for your business. If you have any questions, please contact us.', 50, 750, { align: 'center' });
      doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor)
        .text(user.businessName || 'InvoiceHub', 50, 765, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(pdfPath));
      stream.on('error', (err) => reject(new Error(`Failed to write PDF: ${err.message}`)));
    } catch (error) {
      reject(new Error(`PDF generation error: ${error.message}`));
    }
  });
};

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export const deletePDF = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to delete PDF: ${error.message}`);
  }
  return false;
};