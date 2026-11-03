import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets, cityList } from '../../assets/assets'
import { useAppContext } from '../../context/useAppContext'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/errors'

const Addcar = () => {
const {axios,currency}=useAppContext();
const [image ,setimage]=useState(null)
const [car ,setCar]=useState({
  brand:'',
  model:'',
  year:'',
  pricePerDay:'',
  category:'',
  transmission:'',
  fuel_type:'',
  seating_capacity:'',
  location:'',
  description:'',
})

const [isLoading,setisLoading]=useState(false)
const onsubmitHandler=async(e)=>{
   e.preventDefault() 
  if(isLoading) return null;
  if(!image){ toast.error('Please upload a picture of your car'); return }
  setisLoading(true)
  try {
    const formData=new FormData()
    formData.append('image',image)
    formData.append('carData',JSON.stringify(car))
    const {data}=await axios.post('/api/owner/uploadcar',formData)
    if(data.success)
    {
      toast.success(data.message)
      setimage(null)
      setCar({
        brand:'',
        model:'',
        year:'',
        pricePerDay:'',
        category:'',
        transmission:'',
        fuel_type:'',
        seating_capacity:'',
        location:'',
        description:'',
      })
    }else{
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }finally{
    setisLoading(false)
  }
}

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <Title title="Add New Car" subTitle="Fill in details to list a new car for booking, including pricing, availability and car specification."/>
      <form onSubmit={onsubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>
       {/* car image  */}
       <div className='flex items-center gap-2 w-full'>
        <label htmlFor="car-image">
          <img src={image ? URL.createObjectURL(image) :assets.upload_icon}  alt="" className='h-14 rounded cursor-pointer' />
          <input type="file" id="car-image" accept="image/*" hidden onChange={e=> setimage(e.target.files[0])}/>

          </label>
          <p className='text-sm text-gray-500'>Upload picture of your car</p>
       </div>
       {/* car brand and model */}
       <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* car brand */}
        <div className='flex flex-col w-full'>
         <label >Brand</label>
         <input type="text" placeholder="e.g. BMW,Mercedes,Audi...." required  className='px-3 py-2 border border-bordercolor rounded-md outline-none' value={car.brand} onChange={e=>setCar({...car,brand:e.target.value})}/>

        </div>
        {/* car model */}
        <div className='flex flex-col w-full'>
         <label >Model</label>
         <input type="text" placeholder="e.g. X5, Corolla, Wrangler" required  className='px-3 py-2 border border-bordercolor rounded-md outline-none' value={car.model} onChange={e=>setCar({...car,model:e.target.value})}/>

        </div>
       </div>

       {/* Car year price Category */}
       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        <div className='flex flex-col w-full'>
         <label >Year</label>
         <input type="number" min="1900" placeholder="2025" required  className='px-3 py-2 border border-bordercolor rounded-md outline-none' value={car.year} onChange={e=>setCar({...car,year:e.target.value})}/>
         </div>
          <div className='flex flex-col w-full'>
         <label >Daily Price ({currency})</label>
         <input type="number" min="1" placeholder="100" required  className='px-3 py-2 border border-bordercolor rounded-md outline-none' value={car.pricePerDay} onChange={e=>setCar({...car,pricePerDay:e.target.value})}/>
         </div>
          <div className='flex flex-col w-full'>
         <label >Category</label>
         <select required onChange={e=>setCar({...car,category:e.target.value})} value={car.category} className='px-3 py-2 mt-1 border border-bordercolor rounded-md outline-none'>
          <option value="">Select a category</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Van">Van</option>
         </select>
         </div>

       </div>
      {/* car transmission fuel type Seating capacity */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
       <div className='flex flex-col w-full'>
         <label >Transmission</label>
         <select required onChange={e=>setCar({...car,transmission:e.target.value})} value={car.transmission} className='px-3 py-2 mt-1 border border-bordercolor rounded-md outline-none'>
          <option value="">Select a transmission</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
          <option value="Semi-Automatic">Semi-Automatic</option>
         </select>
         </div> 
          <div className='flex flex-col w-full'>
         <label >Fuel Type</label>
         <select required onChange={e=>setCar({...car,fuel_type:e.target.value})} value={car.fuel_type} className='px-3 py-2 mt-1 border border-bordercolor rounded-md outline-none'>
          <option value="">Select a fuel-type</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="Gas">Gas (CNG/LPG)</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
         </select>
         </div> 
        <div className='flex flex-col w-full'>
         <label >Seating Capacity</label>
         <input type="number" min="1" max="60" placeholder="4" required  className='px-3 py-2 border border-bordercolor rounded-md outline-none mt-1' value={car.seating_capacity} onChange={e=>setCar({...car,seating_capacity:e.target.value})}/>
         </div>
      </div>

      {/* car location */}
      <div className='flex flex-col w-full'>
        <label >Location</label>
         <select required onChange={e=>setCar({...car,location:e.target.value})} value={car.location} className='px-3 py-2 mt-1 border border-bordercolor rounded-md outline-none'>
          <option value="">Select a location</option>
          {cityList.map((city)=><option key={city} value={city}>{city}</option>)}
         </select>

      </div>

      {/* Description */}
       <div className='flex flex-col w-full'>
         <label >Description</label>
         <textarea rows={5} placeholder="A luxurious SUV with a spacious interior and a powerful engine" required  className='px-3 py-2 border border-bordercolor rounded-md outline-none' value={car.description} onChange={e=>setCar({...car,description:e.target.value})}></textarea>
         </div>
        <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer hover:bg-primary-dull'>
        <img src={assets.tick_icon} alt="" />
       { isLoading? 'Listing':'List Your Car'}
       </button>
      </form>
      
    </div>
  )
}

export default Addcar
