import {
  getDashboardStats,
  getDashboardCharts,
  getDashboardActivity,
  getDashboardOverview,
  getRevenueAnalytics,
  getRevenueSummary,
  getAdvancedClientList,
  getClientProfile
} from '../controller/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js'; // Ensure user is logged in
import rateLimiter from '../middleware/rate-limitor.js'
import { getClientRiskAssessment } from '../controller/userRiskAssesment.controller.js';
const router = express.Router();

router.get('/overview', protect, getDashboardOverview); // Deprecated
router.get('/stats', protect, getDashboardStats);
router.get('/charts', protect, getDashboardCharts);
router.get('/activity', protect, getDashboardActivity);
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

router.get(
  '/client-profile/:id',
  rateLimiter({ limit: 20, windowMinutes: 60 }),
  protect,
  getClientProfile
);


export default router;