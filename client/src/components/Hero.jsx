import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/useAppContext'
import { todayISO } from '../utils/dates'
import toast from 'react-hot-toast'

const Hero = () => {
    const { navigate, pickUpDate, setPickUpDate, returnDate, setReturnDate } = useAppContext()
    const [pickuplocation, setpickuplocation] = useState('')

    const onSearch = (e) => {
        e.preventDefault()
        if (returnDate < pickUpDate) {
            toast.error('Return date cannot be before the pickup date.')
            return
        }
        const params = new URLSearchParams({ pickupLocation: pickuplocation, pickupDate: pickUpDate, returnDate })
        navigate(`/cars?${params.toString()}`)
    }

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center'>
        <h1 className='text-4xl md:text-5xl font-semibold'>Luxury Cars on Rent</h1>
       <form onSubmit={onSearch} className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'>
        <div className='flex flex-col md:flex-row items-start md:items-center gap-10 md:ml-8'>
            <div className='flex flex-col items-start gap-2'>
                <select required value={pickuplocation} onChange={(e)=>setpickuplocation(e.target.value)} className='outline-none'>
                    <option value="">Pickup Location</option>
                    {cityList.map((city)=><option key={city} value={city}>{city}</option>)}
                </select>
                <p className='px-1 text-sm text-gray-500'>{pickuplocation ? pickuplocation : 'Please Select Location'}</p>
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor="pickupdate">Pickup Date</label>
                <input value={pickUpDate} onChange={(e)=>setPickUpDate(e.target.value)} type="date" id="pickupdate" className='text-sm text-gray-500' required min={todayISO()}/>
            </div>
            <div className='flex flex-col items-start gap-2'>
                <label htmlFor="returndate">Return Date</label>
                <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} type="date" id="returndate" className='text-sm text-gray-500' required min={pickUpDate || todayISO()} />
            </div>
        </div>
        <button className='flex gap-1 rounded-full bg-primary px-8 py-4 hover:bg-primary-dull cursor-pointer text-white max-sm:mt-10'><img src={assets.search_icon} alt="" className='brightness-300' />Search</button>
       </form>
        <img src={assets.main_car} alt="car" className='max-h-70' />
    </div>
  )
}

export default Hero
