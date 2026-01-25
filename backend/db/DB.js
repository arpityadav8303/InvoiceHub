import mongoose from "mongoose";

const connectdb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing in environment variables");
      return;
    }
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    // process.exit(1); // Removed for Vercel deployment stability
  }
};

export default connectdb;
