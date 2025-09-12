//here we will be creating the api key
import express from "express";
import { getCars, getUserData, loginUser, registerUser } from "../Controllers/userController.js";
import { protect } from "../middleware/auth.js";
const userRouter=express.Router();
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/data',protect,getUserData)
userRouter.get('/cars',getCars)
export default userRouter;