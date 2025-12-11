import express from "express";
import dotenv from "dotenv";
import connectdb from "../backend/db/DB.js"; // adjust path if needed
import authRoutes from "../backend/routes/auth.route.js";
import clientRoutes from "../backend/routes/client.route.js";
import invoiceRoutes from "../backend/routes/invoice.route.js";



dotenv.config();

const app = express();

// Middleware
app.use(express.json());

connectdb();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/api/auth', authRoutes)
app.use('/api/client', clientRoutes)
app.use('/api/invoice', invoiceRoutes)


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});