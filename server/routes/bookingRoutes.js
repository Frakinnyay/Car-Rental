import express from "express";
import {
  changeBookingStatus,
  checkAvailablityOfCar,
  createBoooking,
  getOwnerBooking,
  getUserBooking,
} from "../Controllers/bookingController.js";
import { protect, requireOwner } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availablity", checkAvailablityOfCar);
bookingRouter.post("/create-booking", protect, createBoooking);
bookingRouter.get("/user-booking", protect, getUserBooking);
bookingRouter.get("/owner-booking", protect, requireOwner, getOwnerBooking);
bookingRouter.post("/booking-status", protect, requireOwner, changeBookingStatus);

export default bookingRouter;
