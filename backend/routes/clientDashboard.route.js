import express from "express";
import { getClientDashboardOverview,getInvoiceDetails,downloadInvoicePDF,getClientPayments,getClientProfile } from "../controller/clientDashboard.js";
import rateLimiter from '../middleware/rate-limitor.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/client",
    rateLimiter({ limit: 20, windowMinutes: 60 }),
    protect,
    getClientDashboardOverview
);

router.get("/invoiceDetails",
    rateLimiter({ limit: 20, windowMinutes: 60 }),
    protect,
    getInvoiceDetails
)

router.get("/downloadInvoicePDF/:id",
    rateLimiter({ limit: 20, windowMinutes: 60 }),
    protect,
    downloadInvoicePDF
)

router.get("/clientPayments",
    rateLimiter({ limit: 20, windowMinutes: 60 }),
    protect,
    getClientPayments
)

router.get("/clientProfile",
    rateLimiter({ limit: 20, windowMinutes: 60 }),
    protect,
    getClientProfile
)



export default router;