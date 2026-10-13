
const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Check environment variable
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is missing in environment variables");
  }

  // Reuse the same connection attempt
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URL)
      .then(() => {
        console.log("MongoDB connected successfully");
        return mongoose.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;
