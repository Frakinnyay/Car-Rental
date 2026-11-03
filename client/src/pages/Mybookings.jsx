import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import Loader from '../components/Loader'
import { useAppContext } from '../context/useAppContext'
import { getErrorMessage } from '../utils/errors'

const statusStyle = {
  confirmed: 'bg-green-400/15 text-green-600',
  pending: 'bg-amber-400/15 text-amber-600',
  cancelled: 'bg-red-400/15 text-red-600',
}

const Mybookings = () => {
  const { axios, currency, token, authLoading, setShowLogin } = useAppContext()
  const [bookings, setBooking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    axios
      .get('/api/booking/user-booking')
      .then(({ data }) => {
        if (cancelled) return
        if (data.success) setBooking(data.booking)
        else toast.error(data.message)
      })
      .catch((error) => !cancelled && error?.response?.status !== 401 && toast.error(getErrorMessage(error)))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [axios, token])

  if (authLoading || loading) return <Loader />

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl'>
      <Title title='My bookings' subTitle='View and manage your all car bookings' align="left" />
      {!token ? (
        <p className='mt-12 text-gray-500'>
          Please <button onClick={() => setShowLogin(true)} className='text-primary cursor-pointer'>log in</button> to see your bookings.
        </p>
      ) : bookings.length === 0 ? (
        <p className='mt-12 text-gray-500'>You have no bookings yet.</p>
      ) : (
        <div>
          {bookings.map((booking, index) => (
            <div key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-bordercolor rounded-lg mt-5 first:mt-12'>
              {/* car image and info */}
              <div className='md:col-span-1'>
                <div className='rounded-md overflow-hidden mb-3'>
                  <img src={booking.car?.image} alt="" className='w-full h-auto aspect-video object-cover' />
                </div>
                <p className='text-lg font-medium mt-2'>{booking.car?.brand} {booking.car?.model}</p>
                <p className='text-gray-500'>{booking.car?.year} • {booking.car?.category} • {booking.car?.location}</p>
              </div>
              {/* booking info */}
              <div className='md:col-span-2'>
                <div className='flex items-center gap-2'>
                  <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1}</p>
                  <p className={`px-3 py-1 text-xs rounded-full capitalize ${statusStyle[booking.status] || statusStyle.pending}`}>{booking.status}</p>
                </div>
                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
                  <div>
                    <p className='text-gray-500'>Rental Period</p>
                    <p>{booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}</p>
                  </div>
                </div>
                <div className='flex items-start gap-2 mt-3'>
                  <img src={assets.location_icon} alt="" className='w-4 h-4 mt-1' />
                  <div>
                    <p className='text-gray-500'>Pick-up Location</p>
                    <p>{booking.car?.location}</p>
                  </div>
                </div>
              </div>
              {/* price */}
              <div className='md:col-span-1 flex flex-col justify-between gap-6'>
                <div className='text-sm text-gray-500 text-right'>
                  <p>Total price</p>
                  <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                  <p>Booked on {booking.createdAt.split('T')[0]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Mybookings
