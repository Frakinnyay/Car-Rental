import express from "express";
import { protect, requireOwner } from "../middleware/auth.js";
import {
  addCar,
  deleteCar,
  getDashBoardData,
  getownercar,
  toggleCarAvailablity,
  updaterole,
  updateUserImage,
} from "../Controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

// `protect` runs before `upload` so anonymous requests never reach the file parser.
ownerRouter.post("/change-role", protect, updaterole);
ownerRouter.post("/uploadcar", protect, requireOwner, upload.single("image"), addCar);
ownerRouter.get("/cars", protect, requireOwner, getownercar);
ownerRouter.post("/toggle-car", protect, requireOwner, toggleCarAvailablity);
ownerRouter.post("/delete-car", protect, requireOwner, deleteCar);
ownerRouter.get("/dashboard", protect, requireOwner, getDashBoardData);
ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage);

export default ownerRouter;
