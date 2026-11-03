import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "user"], default: "user" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

// Registered as "User" so `ref: 'User'` in other schemas resolves
// (the collection name stays "users").
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
