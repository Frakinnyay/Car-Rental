import React from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/useAppContext'

const Carbanner = () => {
  const { becomeOwner } = useAppContext()
  return (
    <div className='flex flex-col md:flex-row md:items-start items-center justify-between px-8 min-md:pl-14 pt-10 bg-gradient-to-r from-[#0558FE] to-[#A9CFFF] max-w-6xl mx-3 md:mx-auto rounded-2xl overflow-hidden' >
      <div className='text-white'>
        <h1 className='text-3xl font-medium'>Do You Own a Luxury Car?</h1>
        <p className='mt-2'>Monetize your vehicle effortlessly by listing it on CarRental.</p>
        <p className='max-w-130'>We take care of insurance, driver verification and secure payments — so you can earn passive income, stress-free.</p>
        <button onClick={becomeOwner} className='bg-white text-primary hover:bg-slate-100 cursor-pointer px-6 py-2 rounded-lg mt-4 transition-all'>List your car</button>
      </div>
      <img src={assets.banner_car_image} alt="" className='max-h-45 mt-10'/>
    </div>
  )
}

export default Carbanner
