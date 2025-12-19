import express from 'express';
import {
  sendPaymentReminder,
  sendOverdueReminders,
  sendCustomEmail
} from '../controller/paymentReminder.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Send reminder for specific invoice
router.post('/:invoiceId', protect, sendPaymentReminder);

// Send reminders for all overdue invoices
router.post('/batch/send-overdue', protect, sendOverdueReminders);

// Send custom email to client
router.post('/custom/send', protect, sendCustomEmail);

export default router;