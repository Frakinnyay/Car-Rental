import express from "express";
import rateLimit from "express-rate-limit";
import { getCars, getUserData, loginUser, registerUser } from "../Controllers/userController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

// Brute-force protection for credential endpoints (off in the test environment).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { success: false, message: "Too many attempts. Please try again later." },
});

userRouter.post("/register", authLimiter, registerUser);
userRouter.post("/login", authLimiter, loginUser);
userRouter.get("/data", protect, getUserData);
userRouter.get("/cars", getCars);

export default userRouter;
