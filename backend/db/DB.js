import mongoose from "mongoose";

let isConnected = false; // Track connection status

const connectdb = async () => {
  mongoose.set('strictQuery', true);

  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is missing in environment variables");
      return;
    }

    const db = await mongoose.connect(process.env.MONGO_URI, {
      // dbName: "Khata", // Removed to use default from URI
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
  }
};

export default connectdb;
