import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const carSchema = new mongoose.Schema(
  {
    owner: { type: ObjectId, ref: "User", default: null },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    year: { type: Number, required: true, min: 1900 },
    category: { type: String, required: true, trim: true },
    seating_capacity: { type: Number, required: true, min: 1, max: 60 },
    fuel_type: { type: String, required: true, trim: true },
    transmission: { type: String, required: true, trim: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carSchema.index({ location: 1, isAvailable: 1 });
carSchema.index({ owner: 1 });

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);
export default Car;
