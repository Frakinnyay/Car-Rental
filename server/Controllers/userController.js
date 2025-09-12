import mongoose from "mongoose"
import bcrypt from 'bcrypt'
import User from "../models/User.js"
import jwt from 'jsonwebtoken'
import Car from "../models/Car.js"

//function for generating the token so that reg user can acess the rectricted web pages
const generateToken=(userId)=>{
  const payload=userId;
  return jwt.sign(payload,process.env.JWT_SECRET)
}
//registeruser controller
export const registerUser=async(req,res)=>{
    try {
        const {name,email,password}=req.body
        if(!name || !email || !password ||password.length<8)
        {
            return res.json({success:false, message:'fill the data'})
        }
        const userExist= await User.findOne({email})
        if(userExist)
        {
            return res.json({success:false,message:'Alrady registered email'})
        }
        const hashedpassword=await bcrypt.hash(password,10)
        const user= await User.create({name,email,password:hashedpassword})     
        const token=generateToken(user._id.toString())
        res.json({success:true,token})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//login user
export const loginUser=async(req,res)=>
{
   try {
    const {email,password}=req.body
    const user=await User.findOne({email});
    if(!user)
    {
        return res.json({success:false,message:"User does not exist"})
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        return res.json({success:false,message:"Wrong crendentials"})
    }
    const token=generateToken(user._id.toString())
    res.json({success:true,token})
   } catch (error) {
     console.log(error.message)
     res.json({success:false,message:error.message})
   }
}

//api for getting user data with token
export const getUserData=async(req,res)=>{
    try {
        const {user}=req; 
        return res.json({success:true,user});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}
//api for getting car from fronend
export const getCars=async(req,res)=>{
    try {
        const cars=await Car.find({isAvailable:true})
        res.json({success:true,cars})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}
