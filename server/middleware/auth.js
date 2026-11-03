import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getToken = (req) => {
  const header = req.headers.authorization;
  if (typeof header !== "string" || !header.trim()) return null;
  // Accept both "Bearer <token>" and a bare token.
  return header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim();
};

/** Verifies the JWT signature + expiry and loads the user (without password). */
export const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return res.status(401).json({ success: false, message: "Not authorized" });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
  if (!payload || typeof payload !== "object" || typeof payload.id !== "string") {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(payload.id).select("-password");
  if (!user) return res.status(401).json({ success: false, message: "User no longer exists" });
  req.user = user;
  next();
};

/** Must run after `protect`. */
export const requireOwner = (req, res, next) => {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ success: false, message: "Owner access required" });
  }
  next();
};
