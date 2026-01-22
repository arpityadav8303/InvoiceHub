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

// Manual trigger for Scheduler (secured by secret) - For Render/Cron-job.org
router.post('/scheduler/trigger', async (req, res) => {
  try {
    const secret = req.headers['x-scheduler-secret'];
    if (!secret || secret !== process.env.SCHEDULER_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Import dynamically to avoid circular dependency issues if any
    const { triggerRemindersManually } = await import('../Utils/scheduler.js');

    console.log('🔗 External scheduler trigger received');
    triggerRemindersManually(); // Run in background (don't await to avoid timeout)

    res.status(200).json({
      success: true,
      message: 'Scheduler triggered successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Scheduler trigger error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;