import express from "express";
import { getClientDashboardOverview, getInvoiceDetails, downloadInvoicePDF, getClientPayments, getClientProfile, getClientInvoices } from "../controller/clientDashboard.js";
import { updateClientPassword } from "../controller/auth.controller.js";
import rateLimiter from '../middleware/rate-limitor.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get("/client",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    getClientDashboardOverview
);

router.get("/clientInvoices",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    getClientInvoices
);

router.get("/invoiceDetails",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    getInvoiceDetails
)

router.get("/downloadInvoicePDF/:id",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    downloadInvoicePDF
)

router.get("/clientPayments",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    getClientPayments
)

router.get("/clientProfile",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    getClientProfile
)

router.put("/updateClientPassword",
    rateLimiter({ limit: 50, windowMinutes: 60 }),
    protect,
    updateClientPassword
)



export default router;