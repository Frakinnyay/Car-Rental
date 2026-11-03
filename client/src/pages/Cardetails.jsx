import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/useAppContext'
import { getErrorMessage } from '../utils/errors'
import { rentalDays, todayISO } from '../utils/dates'

const Cardetails = () => {
  const { id } = useParams()
  const { cars, carsLoading, axios, navigate, token, setShowLogin, currency, pickUpDate, setPickUpDate, returnDate, setReturnDate } = useAppContext()
  const [submitting, setSubmitting] = useState(false)
  const car = cars.find((c) => c._id === id)
  const days = rentalDays(pickUpDate, returnDate)

  const Handlesubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      toast('Please log in to book this car')
      setShowLogin(true)
      return
    }
    if (returnDate < pickUpDate) {
      toast.error('Return date cannot be before the pickup date.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await axios.post('/api/booking/create-booking', { car: id, pickupDate: pickUpDate, returnDate })
      if (data.success) {
        toast.success(data.message)
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (carsLoading) return <Loader />
  if (!car) {
    return (
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-32 text-gray-500'>
        <p className='text-lg'>This car is not available any more.</p>
        <button onClick={() => navigate('/cars')} className='mt-4 text-primary cursor-pointer'>Browse all cars</button>
      </div>
    )
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-32'>
      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        <p>Back to all cars</p>
      </button>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        <div className='lg:col-span-2'>
          <img src={car.image} alt={`${car.brand} ${car.model}`} className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} {car.year}</p>
            </div>
            <hr className='border-bordercolor my-6' />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: `${car.fuel_type}` },
                { icon: assets.car_icon, text: `${car.transmission}` },
                { icon: assets.location_icon, text: `${car.location}` },
              ].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </div>
              ))}
            </div>
            <div>
              <h1 className='text-lg font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{car.description}</p>
            </div>
            <div>
              <h1 className='text-lg font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear view mirror"].map((item) => (
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} alt="" className='h-4 mr-2' />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <form onSubmit={Handlesubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay} <span className='text-base text-gray-400 font-normal'>per day</span></p>
          <hr className='border-bordercolor my-6' />
          <div className='flex flex-col gap-2'>
            <label htmlFor="pickupdate">Pickup Date</label>
            <input value={pickUpDate} onChange={(e) => setPickUpDate(e.target.value)} type="date" id="pickupdate" className='border border-bordercolor px-3 py-2 rounded-lg' required min={todayISO()} />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor="returndate">Return Date</label>
            <input value={returnDate} onChange={(e) => setReturnDate(e.target.value)} type="date" id="returndate" className='border border-bordercolor px-3 py-2 rounded-lg' required min={pickUpDate || todayISO()} />
          </div>
          {days > 0 && (
            <p className='flex justify-between text-gray-700'>
              <span>{days} {days === 1 ? 'day' : 'days'}</span>
              <span className='font-semibold'>{currency}{days * car.pricePerDay}</span>
            </p>
          )}
          <button disabled={submitting} className='w-full bg-primary cursor-pointer py-4 rounded-xl text-white hover:bg-primary-dull font-medium disabled:opacity-60 disabled:cursor-not-allowed'>{submitting ? 'Booking...' : 'Book Now'}</button>
          <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>
      </div>
    </div>
  )
}

export default Cardetails
