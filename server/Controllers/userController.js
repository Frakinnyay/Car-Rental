import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Car from "../models/Car.js";
import { HttpError, isString } from "../utils/validate.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signed, expiring token. Payload is an object so `jwt.verify` can validate it.
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (![name, email, password].every(isString)) throw new HttpError(400, "Name, email and password are required.");
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || cleanName.length > 100) throw new HttpError(400, "Please enter a valid name.");
  if (!EMAIL_RE.test(cleanEmail)) throw new HttpError(400, "Please enter a valid email address.");
  if (password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (password.length > 72) throw new HttpError(400, "Password must be at most 72 characters.");

  if (await User.exists({ email: cleanEmail })) throw new HttpError(409, "This email is already registered.");

  const hashed = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await User.create({ name: cleanName, email: cleanEmail, password: hashed });
  } catch (err) {
    if (err?.code === 11000) throw new HttpError(409, "This email is already registered.");
    throw err;
  }
  res.status(201).json({ success: true, token: generateToken(user._id.toString()) });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!isString(email) || !isString(password)) throw new HttpError(400, "Email and password are required.");
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  // Same message for unknown email and wrong password (no account enumeration).
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new HttpError(401, "Invalid email or password.");
  res.json({ success: true, token: generateToken(user._id.toString()) });
};

// `protect` already loaded the user without the password field.
export const getUserData = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Public list of cars that can currently be rented.
export const getCars = async (req, res) => {
  const cars = await Car.find({ isAvailable: true, owner: { $ne: null } }).sort({ createdAt: -1 });
  res.json({ success: true, cars });
};
