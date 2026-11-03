import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];

const bookingSchema = new mongoose.Schema(
  {
    car: { type: ObjectId, ref: "Car", required: true },
    user: { type: ObjectId, ref: "User", required: true },
    owner: { type: ObjectId, ref: "User", required: true },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

bookingSchema.path("returnDate").validate(function (value) {
  return !this.pickupDate || value >= this.pickupDate;
}, "Return date cannot be before the pickup date.");

bookingSchema.index({ car: 1, status: 1, pickupDate: 1, returnDate: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
