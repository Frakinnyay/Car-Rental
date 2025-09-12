import Booking from "../models/Booking.js"
import Car from "../models/Car.js";


//functionality to check car availablity
const checkAvailablity=async(car,pickupDate,returnDate)=>{
const booking =await Booking.find({
    car,
    pickupDate:{$lte:returnDate},
    returnDate:{$gte:pickupDate},
})
return booking.length === 0;
}

//Api to check car availablity of a car for given Date And Locaation

export const checkAvailablityOfCar=async(req,res)=>{
    try {
        const {location,pickupDate,returnDate}=req.body
        //list of car for given location
        const car=await Car.find({location,isAvailable:true})
        //Check availaablity of car in a date range using promise
        const availableCarPromises=car.map( async(car)=>{
            //car._id is car model ke ander jo _id hai uska use karna hai
          const isAvailable=await checkAvailablity(car._id,pickupDate,returnDate)
          //_doc contains all property of car because mgdb store info in _doc
          return {...car._doc,isAvailable:isAvailable}
        })
        let availableCars= await Promise.all(availableCarPromises)
        availableCars=availableCars.filter(car=>car.isAvailable===true)
        res.json({success:true,availableCars})
        
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}


//api to create booking
export const createBoooking=async(req,res)=>{
    try {
        const{_id}=req.user
        const{car,pickupDate,returnDate}=req.body
        const isAvailable=checkAvailablity(car,pickupDate,returnDate)
        if(!isAvailable)
        {
            res.json({success:false,message:"Not Available"})
        }
        const carData=await Car.findById(car)
        //calculate the price
        const picked=new Date(pickupDate)
        const returned=new Date(returnDate)
        const noOfDays=Math.ceil((returned-picked)/(1000*60*60*24))
        const price =carData.pricePerDay*noOfDays
        await Booking.create({car,owner:carData.owner,user:_id,pickupDate,returnDate,price})
        res.json({success:true,message:"Booking has been created"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to get user booking
export const getUserBooking=async(req,res)=>{
    try {
        const {_id}=req.user
        const booking= await Booking.find({user:_id}).populate("car").sort({createdAt:-1})
        res.json({success:true,booking})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//api to get owner booking
export const getOwnerBooking=async(req,res)=>{
    try {
       if(req.user.role !== 'owner')
       {
        return res.json({success:false,message:"Unauthorized"})
       }
       const booking=await Booking.find({owner:req.user._id}).populate('car  user').select("-user.password").sort({createdAt:-1})
       res.json({success:false,booking})
    } catch (error) {
        console.log(error.message)
        res.json({success:true,message:error.message})
    }
}

//api to change booking status
export const changeBookingStatus=async(req,res)=>{
    try {
       const {_id}=req.user
       const {bookingId,status}=req.body
       const booking=Booking.findById(bookingId)
       if(booking.owner.toString()!==_id.toString())
       {
        return res.json({success:false,message:"Unauthorized"})
       }
       booking.status=status;
       await booking.save()
       res.json({success:true,meesage:"Status has changed"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}