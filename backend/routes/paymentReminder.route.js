import express from 'express';
import {
  sendPaymentReminder,
  sendOverdueReminders,
  sendCustomEmail
} from '../controller/paymentReminder.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import rateLimiter from '../middleware/rate-limitor.js'

const router = express.Router();

// Send reminders for all overdue invoices (MUST be before :invoiceId route)
router.post('/batch/send-overdue', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, sendOverdueReminders);

// Send custom email to client
router.post('/custom/send', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, sendCustomEmail);

// Send reminder for specific invoice (MUST be last)
router.post('/:invoiceId', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, sendPaymentReminder);

export default router;