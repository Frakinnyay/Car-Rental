import express, { response } from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"

//Initialize Express app
const app=express()

//DataBase Connected
await connectDB()

//Middleware
app.use(cors());
app.use(express.json());

//routing
app.get('/',(req,res)=>res.send("Server is running"))
//when any request come to api/user handle with using userRouter
app.use('/api/user',userRouter)
//api created for updating the role from user to owner
app.use('/api/owner',ownerRouter)
//api created for managing booking data
app.use('/api/booking',bookingRoutes)
//get the port form env
const PORT=process.env.PORT ||3000;
//to start the  express server
app.listen(PORT, ()=>console.log(`Server is running on port ${PORT}`))
