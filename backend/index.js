import express from "express";
import dotenv from "dotenv";
import connectdb from "../backend/db/DB.js"; 
import authRoutes from "../backend/routes/auth.route.js";
import clientRoutes from "../backend/routes/client.route.js";
import invoiceRoutes from "../backend/routes/invoice.route.js";
import paymentRoutes from "../backend/routes/payment.route.js";
import dashboardRoutes from "../backend/routes/dashboard.route.js";
import dayjs from "dayjs";
import paymentReminderRoutes from "../backend/routes/paymentReminder.route.js";
import { initScheduler } from "./Utils/scheduler.js";


dotenv.config();

const app = express();

// Middleware
app.use(express.json());

connectdb();
initScheduler();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api/auth', authRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/invoice', invoiceRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/payment-reminder', paymentReminderRoutes)
app.use('/api/dashboard', dashboardRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});