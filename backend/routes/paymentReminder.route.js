import express from 'express';
import {
  sendPaymentReminder,
  sendOverdueReminders,
  sendCustomEmail
} from '../controller/paymentReminder.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Send reminders for all overdue invoices (MUST be before :invoiceId route)
router.post('/batch/send-overdue', protect, sendOverdueReminders);

// Send custom email to client
router.post('/custom/send', protect, sendCustomEmail);

// Send reminder for specific invoice (MUST be last)
router.post('/:invoiceId', protect, sendPaymentReminder);

export default router;