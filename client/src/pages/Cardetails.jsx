import React, { useEffect, useState } from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import {assets, dummyCarData} from '../assets/assets'
import Loader from '../components/Loader'

const Cardetails = () => {
  const {id}=useParams()
  const navigate=useNavigate();
  const[car,setcar]=useState(null)
  const currency=import.meta.env.VITE_CURRENCY
  const Handlesubmit=async(e)=>{
    e.preventDefault();
  }
  useEffect(()=>{
     setcar(dummyCarData.find(car=>car._id===id))
  },[id])
  return car ?(
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-32'>
      <button onClick={()=>navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer '>
        <img src={assets.arrow_icon} alt="arrowicon" className='rotate-180 opacity-65' />
        <p>Back to all car</p>
      </button>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
         {/* this is left car and image  */}
        <div className='lg:col-span-2 '>
           <img src={car.image} alt="car-image" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
           <div className='space-y-6'>
             <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} {car.year}</p>
             </div>
             <hr className='border-bordercolor my-6'/>
             <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {
              [
                {icon :assets.users_icon, text:`${car.seating_capacity} Seats`},
                {icon :assets.fuel_icon, text:`${car.fuel_type} `},
                {icon :assets.car_icon, text:`${car.transmission} `},
                {icon :assets.location_icon, text:`${car.location}`}
              ].map(({icon,text})=>(
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                   <img src={icon} alt="icon" className='h-5 mb-2'/>
                   {text}
                </div>
              ))
            }
             </div>
             {/* this is deription */}
             <div>
              <h1 className='text-lg font-medium mb-3 '>Decription</h1>
              <p className='text-gray-500'>{car.description}</p>
             </div>
             {/* this are features */}
             <div>
              <h1 className='text-lg font-medium mb-3 '>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
               {
                ["360 Camera" ,"Bluetooth", "GPS","Heated Seats", "Rear view mirror"].map((item)=>(
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} alt="checked icon" className='h-4 mr-2' />{item}
                  </li>
                ))
               }
              </ul>
             </div>
           </div>
        </div>
        {/* this is form page for selecting car */}
        <form onSubmit={Handlesubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500' action="">
           <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay} <span className='text-base text-gray-400 font-normal'>per day</span></p>
           <hr className='border-bordercolor my-6' />
           <div className='flex flex-col gap-2 '>
            <label htmlFor="pickupdate">Pickup Date</label>
            <input type="date"  id="pickupdate" className='border border-bordercolor px-3 py-2 rounded-lg' required min={new Date().toISOString().split('T')[0]} />
           </div>
           <div className='flex flex-col gap-2 '>
            <label htmlFor="returndate">Return Date</label>
            <input type="date"  id="returndate" className='border border-bordercolor px-3 py-2 rounded-lg' required min={new Date().toISOString().split('T')[0]} />
           </div>
           <button className='w-full bg-primary cursor-pointer  py-4 rounded-xl text-white hover:bg-primary-dull tracking-all font-medium'>Book Now </button>
           <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>
      </div>
    </div>
  ) :<Loader/>
}

export default Cardetails
