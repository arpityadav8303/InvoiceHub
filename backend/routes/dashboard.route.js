import express from 'express';
import { getDashboardOverview,getRevenueAnalytics,getRevenueSummary,getAdvancedClientList } from '../controller/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Ensure user is logged in
import rateLimiter from '../middleware/rate-limitor.js'
import { getClientRiskAssessment } from '../controller/userRiskAssesment.controller.js';
const router = express.Router();

router.get('/overview', protect, getDashboardOverview);
router.get(
  '/revenue',
  rateLimiter({ limit: 20, windowMinutes: 60 }),
  protect,
  getRevenueAnalytics
);

router.get(
  '/revenue-summary',
  rateLimiter({ limit: 20, windowMinutes: 60 }),
  protect,
  getRevenueSummary
);

router.get(
  '/clients',
  rateLimiter({ limit: 20, windowMinutes: 60 }),
  protect,
  getAdvancedClientList
);

router.get(
  '/risk-assessment/:id',
  rateLimiter({ limit: 20, windowMinutes: 60 }),
  protect,
  getClientRiskAssessment
);


export default router;