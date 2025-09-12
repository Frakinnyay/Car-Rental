import express from "express"
import { protect } from "../middleware/auth.js";
import { addCar, deleteCar, getDashBoardData, getownercar, toggleCarAvailablity, updaterole, updateUserImage } from "../Controllers/ownerController.js";
import upload from "../middleware/multer.js";
const ownerRouter=express.Router();
ownerRouter.post('/Change-role',protect,updaterole);
ownerRouter.post("/uploadcar",upload.single("image"),protect,addCar);
ownerRouter.get("/cars",protect,getownercar);
ownerRouter.post("/toggle-car",protect,toggleCarAvailablity);
ownerRouter.post("/delete-car",protect,deleteCar);
ownerRouter.get("/dashboard",protect,getDashBoardData)
ownerRouter.post("/update-image",upload.single("image"),protect,updateUserImage)
export default ownerRouter;