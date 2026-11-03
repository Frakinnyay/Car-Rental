/**
 * Optional demo data: creates (or re-uses) an owner account and four sample
 * cars so the UI has something to show without ImageKit.
 *
 *   SEED_OWNER_EMAIL=owner@example.com SEED_OWNER_PASSWORD='choose-a-password' npm run seed
 *
 * Car images point at /demo-cars/*.png, which the client serves from its own
 * `public/` folder, so the demo only works when the client is served from the
 * same site you open in the browser (local dev or a normal client deployment).
 * Refuses to run when NODE_ENV=production unless SEED_ALLOW_PRODUCTION=true.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Car from "../models/Car.js";

const { SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD, SEED_OWNER_NAME = "Demo Owner" } = process.env;

if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
  console.error("Refusing to seed while NODE_ENV=production (set SEED_ALLOW_PRODUCTION=true to override).");
  process.exit(1);
}
if (!SEED_OWNER_EMAIL || !SEED_OWNER_PASSWORD || SEED_OWNER_PASSWORD.length < 8) {
  console.error("Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD (min 8 chars) in the environment first.");
  process.exit(1);
}

const cars = [
  { brand: "BMW", model: "X5", image: "/demo-cars/car_image1.png", year: 2006, category: "SUV", seating_capacity: 4, fuel_type: "Hybrid", transmission: "Semi-Automatic", pricePerDay: 300, location: "New York", description: "The BMW X5 is a mid-size luxury SUV produced by BMW. The X5 made its debut in 1999 as the first SUV ever produced by BMW." },
  { brand: "Toyota", model: "Corolla", image: "/demo-cars/car_image2.png", year: 2021, category: "Sedan", seating_capacity: 4, fuel_type: "Diesel", transmission: "Manual", pricePerDay: 130, location: "Chicago", description: "The Toyota Corolla is a mid-size sedan produced by Toyota, known for reliability and fuel economy." },
  { brand: "Jeep", model: "Wrangler", image: "/demo-cars/car_image3.png", year: 2023, category: "SUV", seating_capacity: 4, fuel_type: "Hybrid", transmission: "Automatic", pricePerDay: 200, location: "Los Angeles", description: "The Jeep Wrangler is a rugged off-road SUV produced by Jeep, first introduced in 1986." },
  { brand: "Ford", model: "Neo 6", image: "/demo-cars/car_image4.png", year: 2022, category: "Sedan", seating_capacity: 2, fuel_type: "Diesel", transmission: "Semi-Automatic", pricePerDay: 209, location: "Houston", description: "A comfortable two-seat sedan from Ford, great for city driving." },
];

await connectDB();
const email = SEED_OWNER_EMAIL.trim().toLowerCase();
let owner = await User.findOne({ email });
if (!owner) {
  owner = await User.create({ name: SEED_OWNER_NAME, email, password: await bcrypt.hash(SEED_OWNER_PASSWORD, 10), role: "owner" });
  console.log(`Created owner account ${email}`);
} else {
  if (owner.role !== "owner") await User.updateOne({ _id: owner._id }, { role: "owner" });
  console.log(`Using existing account ${email}`);
}

let created = 0;
for (const car of cars) {
  const exists = await Car.exists({ owner: owner._id, brand: car.brand, model: car.model });
  if (!exists) {
    await Car.create({ ...car, owner: owner._id, isAvailable: true });
    created++;
  }
}
console.log(`Seed complete: ${created} car(s) added.`);
await mongoose.disconnect();
