import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { HttpError } from "./utils/validate.js";

const isProd = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Copy .env.example to .env and set a long random value.");
}
if (isProd && process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

const app = express();
app.set("trust proxy", 1); // correct client IPs behind Vercel/Render/Nginx (rate limiting)
app.disable("x-powered-by");

// CORS: comma-separated list in CLIENT_URL. Requests without an Origin header
// (curl, server-to-server) are always allowed. Auth uses the Authorization
// header (no cookies), so CORS is defence-in-depth rather than the only guard.
const allowedOrigins = (process.env.CLIENT_URL || (isProd ? "" : "http://localhost:5173"))
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  })
);
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.body ??= {}; // Express 5 leaves req.body undefined when there is no body
  next();
});

app.get("/", (req, res) => res.send("Server is running"));
app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

// Make sure the DB is connected before any API handler runs (cached; also
// covers serverless cold starts).
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    res.status(503).json({ success: false, message: "Service temporarily unavailable" });
  }
});

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/booking", bookingRouter);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Central error handler: consistent { success:false, message } envelope.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message;
  if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 4 MB)." : err.message;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body.";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(" ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier.";
  }
  if (status >= 500) {
    console.error(err);
    if (isProd && !err.expose) message = "Something went wrong. Please try again.";
  }
  res.status(status).json({ success: false, message });
});

export default app;
