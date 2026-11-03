import Booking, { BOOKING_STATUSES } from "../models/Booking.js";
import Car from "../models/Car.js";
import { HttpError, isNonEmptyString, isValidId, validateRentalRange } from "../utils/validate.js";

// Cancelled bookings do not block a car; every other status does.
const ACTIVE = { $ne: "cancelled" };
// Inclusive overlap: [pickup, return] intersects an existing [pickup, return].
const overlap = (pickup, ret) => ({ pickupDate: { $lte: ret }, returnDate: { $gte: pickup } });

/** Public: cars in a city that are free for the whole date range. */
export const checkAvailablityOfCar = async (req, res) => {
  const { location, pickupDate, returnDate } = req.body;
  if (!isNonEmptyString(location)) throw new HttpError(400, "Pickup location is required.");
  const range = validateRentalRange(pickupDate, returnDate);
  if (range.error) throw new HttpError(400, range.error);

  const cars = await Car.find({ location: location.trim(), isAvailable: true, owner: { $ne: null } });
  const busyIds = (
    await Booking.distinct("car", { car: { $in: cars.map((c) => c._id) }, status: ACTIVE, ...overlap(range.pickup, range.ret) })
  ).map(String);
  const availableCars = cars.filter((c) => !busyIds.includes(c._id.toString()));
  res.json({ success: true, availableCars });
};

export const createBoooking = async (req, res) => {
  const { _id: userId } = req.user;
  const { car, pickupDate, returnDate } = req.body;
  if (!isValidId(car)) throw new HttpError(400, "A valid car is required.");
  const range = validateRentalRange(pickupDate, returnDate);
  if (range.error) throw new HttpError(400, range.error);

  const carData = await Car.findById(car);
  if (!carData) throw new HttpError(404, "Car not found.");
  if (!carData.isAvailable || !carData.owner) throw new HttpError(409, "This car is not available for booking.");

  const conflict = () => Booking.exists({ car: carData._id, status: ACTIVE, ...overlap(range.pickup, range.ret) });
  if (await conflict()) throw new HttpError(409, "This car is already booked for the selected dates.");

  const booking = await Booking.create({
    car: carData._id,
    owner: carData.owner,
    user: userId,
    pickupDate: range.pickup,
    returnDate: range.ret,
    price: carData.pricePerDay * range.days,
  });

  // Guard against two simultaneous requests passing the check above:
  // the booking with the smaller _id wins, the other one is rolled back.
  const earlier = await Booking.exists({
    _id: { $lt: booking._id },
    car: carData._id,
    status: ACTIVE,
    ...overlap(range.pickup, range.ret),
  });
  if (earlier) {
    await Booking.deleteOne({ _id: booking._id });
    throw new HttpError(409, "This car is already booked for the selected dates.");
  }

  res.status(201).json({ success: true, message: "Booking has been created", bookingId: booking._id });
};

export const getUserBooking = async (req, res) => {
  const booking = await Booking.find({ user: req.user._id }).populate("car").sort({ createdAt: -1 });
  res.json({ success: true, booking });
};

export const getOwnerBooking = async (req, res) => {
  const booking = await Booking.find({ owner: req.user._id })
    .populate("car")
    .populate("user", "-password")
    .sort({ createdAt: -1 });
  res.json({ success: true, booking });
};

export const changeBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  const nextStatus = typeof status === "string" ? status.toLowerCase() : status;
  if (!isValidId(bookingId)) throw new HttpError(400, "A valid booking is required.");
  if (!BOOKING_STATUSES.includes(nextStatus)) throw new HttpError(400, "Invalid booking status.");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new HttpError(404, "Booking not found.");
  if (booking.owner.toString() !== req.user._id.toString()) throw new HttpError(403, "Unauthorized");
  if (booking.status === "cancelled" && nextStatus !== "cancelled") {
    throw new HttpError(409, "A cancelled booking cannot be re-opened. Ask the customer to book again.");
  }

  booking.status = nextStatus;
  await booking.save();
  res.json({ success: true, message: "Status has changed" });
};
