import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

// On Vercel the exported app is invoked per request (no listen, lazy DB connect).
// Everywhere else: connect first, fail fast, then listen.
if (!process.env.VERCEL) {
  try {
    await connectDB();
  } catch (err) {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  }
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

export default app;
