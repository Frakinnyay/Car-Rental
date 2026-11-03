import mongoose from "mongoose";

let connecting = null;

/**
 * Connects to MongoDB once and re-uses the connection (important for
 * serverless platforms like Vercel where the module may be re-used).
 * MONGODB_URI is the cluster connection string; the database name comes
 * from MONGODB_DB_NAME (default: car-rental).
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  }
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB_NAME || "car-rental",
        serverSelectionTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("Database is connected");
        return m.connection;
      })
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
};

export default connectDB;
