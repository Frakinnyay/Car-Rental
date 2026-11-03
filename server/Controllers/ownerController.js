import User from "../models/User.js";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import { uploadImage } from "../utils/uploadImage.js";
import { HttpError, isNonEmptyString, isValidId } from "../utils/validate.js";

// A signed-in user becomes an owner (the "List your car" button).
export const updaterole = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { role: "owner" });
  res.json({ success: true, message: "You can list your car" });
};

const num = (v) => (typeof v === "number" || (typeof v === "string" && v.trim() !== "") ? Number(v) : NaN);

// Only these fields can be set by the client (no mass-assignment of owner/image/etc.).
const parseCarInput = (raw) => {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid car data.");
  }
  if (!data || typeof data !== "object") throw new HttpError(400, "Invalid car data.");

  const car = {
    brand: data.brand,
    model: data.model,
    category: data.category,
    fuel_type: data.fuel_type,
    transmission: data.transmission,
    location: data.location,
    description: data.description,
    year: num(data.year),
    pricePerDay: num(data.pricePerDay),
    seating_capacity: num(data.seating_capacity),
  };
  for (const key of ["brand", "model", "category", "fuel_type", "transmission", "location", "description"]) {
    if (!isNonEmptyString(car[key])) throw new HttpError(400, `Please provide a value for "${key}".`);
    car[key] = car[key].trim();
  }
  const thisYear = new Date().getFullYear();
  if (!Number.isInteger(car.year) || car.year < 1900 || car.year > thisYear + 1) throw new HttpError(400, "Please enter a valid year.");
  if (!Number.isFinite(car.pricePerDay) || car.pricePerDay <= 0) throw new HttpError(400, "Daily price must be greater than 0.");
  if (!Number.isInteger(car.seating_capacity) || car.seating_capacity < 1 || car.seating_capacity > 60) {
    throw new HttpError(400, "Please enter a valid seating capacity.");
  }
  return car;
};

export const addCar = async (req, res) => {
  if (!req.file) throw new HttpError(400, "A car image is required.");
  if (!isNonEmptyString(req.body.carData)) throw new HttpError(400, "Car details are required.");
  const car = parseCarInput(req.body.carData);
  const image = await uploadImage(req.file, "/cars");
  await Car.create({ ...car, owner: req.user._id, image, isAvailable: true });
  res.status(201).json({ success: true, message: "Car has been added" });
};

export const getownercar = async (req, res) => {
  const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, cars });
};

const findOwnedCar = async (carId, userId) => {
  if (!isValidId(carId)) throw new HttpError(400, "A valid car is required.");
  const car = await Car.findById(carId);
  if (!car) throw new HttpError(404, "Car not found.");
  if (!car.owner || car.owner.toString() !== userId.toString()) throw new HttpError(403, "Unauthorized");
  return car;
};

export const toggleCarAvailablity = async (req, res) => {
  const car = await findOwnedCar(req.body.carId, req.user._id);
  car.isAvailable = !car.isAvailable;
  await car.save();
  res.json({ success: true, message: "Availablity Toggled" });
};

// "Delete" detaches the car from its owner and hides it, so existing bookings
// that reference the car keep working in booking history.
export const deleteCar = async (req, res) => {
  const car = await findOwnedCar(req.body.carId, req.user._id);
  car.owner = null;
  car.isAvailable = false;
  await car.save();
  res.json({ success: true, message: "Car Removed" });
};

export const getDashBoardData = async (req, res) => {
  const owner = req.user._id;
  const startOfMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));

  const [totalCars, bookings, pendingBookings, completedBookings, revenue] = await Promise.all([
    Car.countDocuments({ owner }),
    Booking.find({ owner }).populate("car").sort({ createdAt: -1 }),
    Booking.countDocuments({ owner, status: "pending" }),
    Booking.countDocuments({ owner, status: "confirmed" }),
    Booking.aggregate([
      { $match: { owner, status: "confirmed", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]),
  ]);

  res.json({
    success: true,
    dashboardData: {
      totalCars,
      totalBookings: bookings.length,
      pendingBookings,
      completedBookings,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue: revenue[0]?.total ?? 0,
    },
  });
};

export const updateUserImage = async (req, res) => {
  if (!req.file) throw new HttpError(400, "An image is required.");
  const image = await uploadImage(req.file, "/users");
  await User.findByIdAndUpdate(req.user._id, { image });
  res.json({ success: true, message: "Image updated" });
};
