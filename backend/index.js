import express from "express";
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from "dotenv";
import connectdb from "../backend/db/DB.js";
import authRoutes from "../backend/routes/auth.route.js";
import clientRoutes from "../backend/routes/client.route.js";
import invoiceRoutes from "../backend/routes/invoice.route.js";
import paymentRoutes from "../backend/routes/payment.route.js";
import dashboardRoutes from "../backend/routes/dashboard.route.js";
import clientDashboardRoutes from "./routes/clientDashboard.route.js"
import dayjs from "dayjs";
import paymentReminderRoutes from "../backend/routes/paymentReminder.route.js";
import { initScheduler } from "./Utils/scheduler.js";
import cors from "cors";
import { errorHandler, asyncHandler } from "./middleware/errorHandler.js";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

connectdb();
initScheduler();

app.get("/", (req, res) => {
  res.send({ status: "API is running...", version: "1.0.1", deployedAt: new Date().toISOString() });
});

// app.use(cors({
//   origin: 'http://localhost:5173',  // frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true                 // if you use cookies or auth headers
// }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://invoice-hub-rust.vercel.app', // Your Vercel frontend URL
    process.env.FRONTEND_URL               // Allow environment variable override
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use('/api/auth', authRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/invoice', invoiceRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/payment-reminder', paymentReminderRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/clientDashboard', clientDashboardRoutes)
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});