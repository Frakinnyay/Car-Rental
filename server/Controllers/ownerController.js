import imagekit from "../config/imageKit.js";
import User from "../models/User.js";
import fs from 'fs'
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
//api to change user status
export const updaterole=async(req,res)=>{
    try {
        const {_id}=req.user;
        await User.findByIdAndUpdate(_id,{role:"owner"});
        res.json({success:true,message:"You can list your car"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:"error.message"})
    }
}
//api to list car
export const addCar=async(req,res)=>{
    try {
        const {_id}=req.user
        //json.parse is used for converting from string to json object
        let car=JSON.parse(req.body.carData)
        //multer add the file automaticaaly in the req.file
        const imageFile=req.file;
        //here we have converted the image to base64 format using filesystem 'fs'
        //since in image kit it is required file format for uploading it.
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response=await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/cars'
        })
        // Optimize through ImageKit URL generation
        var optimizedImageUrl = imagekit.url
       ({
           path: response.filePath,
           transformation : 
           [
            {width:'1280'},//width resizing
            {quality:'auto'},//Auto compression
            {format:'webp'} //Convert to Modern format(supported on all web application & very light size)
           ]
       });
       //stored the url of image in image variable
       const image=optimizedImageUrl;
       //... is spread operator here it add all the details of elements
       //like here the car conatins too many detials like brand fuel milage price etc
       //so in order to pass all the info here to create or add new car we need to use the
       //spread operator here.
       await Car.create({...car,owner:_id,image});
       res.json({success:true,message:"Car has been added"})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to list owner all car
export const getownercar=async(req,res)=>{
    try {
        const {_id}=req.user
        const cars=await Car.find({owner:_id})
        res.json({success:true,cars})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to toggle car activity
export const toggleCarAvailablity=async(req,res)=>{
    try {
        const {_id}=req.user
        const {carId}=req.body
        const car=await Car.findById(carId)
        //checking is car belong to user
        if(car.owner.toString() !==_id.toString())
        {
            return res.json({success:false,message:"Unauthorized"})
        }
        car.isAvailable =!car.isAvailable;
        await car.save();
        res.json({success:true,message:"Availablity Toggled"})
        
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to delete car
export const deleteCar=async(req,res)=>{
    try {
        const {_id}=req.user
        const {carId}=req.body
        const car=await Car.findById(carId)
        //checking is car belong to user
        if(car.owner.toString() !==_id.toString())
        {
            return res.json({success:false,message:"Unauthorized"})
        }
       car.owner=null;
       car.isAvailable=false;
       await car.save();
       res.json({success:true,message:"Car Removed"})  
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to get dashboard data

export const getDashBoardData =async(req,res)=>{
    try {
        const {_id,role}=req.user
        if(role!=='owner')
        {
           return res.json({success:false,message:"Unauthorized"});
        }
        const cars=await Car.find({owner:_id})
        const booking=await Booking.find({owner:_id}).populate('car').sort({createdAt:-1})
        const pendingBookings=await Booking.find({owner:_id,status:"pending"})
        const confirmedBookings=await Booking.find({owner:_id,status:"confirmed"})
        //calculate monthly revenue where staus is confirmed
        const monthlyRevenue= booking.slice().filter(booking=>booking.status==='confirmed').reduce(acc,booking=>acc +booking.price,0)
        //this part can also be writte as 
        // const confirmedBookingsOnly = booking.filter(b => b.status === 'confirmed');
       //  let monthlyRevenue = 0;
      //   for (let b of confirmedBookingsOnly) {
     //    monthlyRevenue += b.price;
     // }

        const dashBoradData={
            totleCars:cars.length,
            totalBookings:booking.length,
            pendingBookings:pendingBookings.length,
            confirmedBookings:confirmedBookings.length,
            recentBookings:booking.slice(0,3),
            monthlyRevenue
        }
        res.json({success:true,dashBoradData})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:"error.message"})
    }
}

//api to update user image
export const updateUserImage=async(req,res)=>{
    try {
        const {_id}=req.user
        const imageFile=req.file;
        //here we have converted the image to base64 format using filesystem 'fs'
        //since in image kit it is required file format for uploading it.
        const fileBuffer=fs.readFileSync(imageFile.path)
        const response=await imagekit.upload({
            file:fileBuffer,
            fileName:imageFile.originalname,
            folder:'/users'
        })
        // Optimize through ImageKit URL generation
        var optimizedImageUrl = imagekit.url
       ({
           path: response.filePath,
           transformation : 
           [
            {width:'1280'},//width resizing
            {quality:'auto'},//Auto compression
            {format:'webp'} //Convert to Modern format(supported on all web application & very light size)
           ]
       });
       //stored the url of image in image variable
       const image=optimizedImageUrl;
       await User.findByIdAndUpdate(_id,{image})
       res.json({success:true,message:"image updated"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}