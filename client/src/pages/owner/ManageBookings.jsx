import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/useAppContext'
import { getErrorMessage } from '../../utils/errors'

const ManageBookings = () => {
  const { isOwner, axios, currency } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchbookings = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/booking/owner-booking')
      if (data.success) setBookings(data.booking)
      else toast.error(data.message)
    } catch (error) {
      if (error?.response?.status !== 401) toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [axios])

  const changeStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/booking/booking-status', { bookingId, status })
      if (data.success) {
        toast.success(data.message)
        fetchbookings()
      } else toast.error(data.message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  useEffect(() => {
    if (isOwner) fetchbookings()
  }, [isOwner, fetchbookings])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title title="Manage Bookings" subTitle="Track all customer bookings, approve or cancel requests, and manage booking status" />
      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-bordercolor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Customer</th>
              <th className='p-3 font-medium max-md:hidden'>Date range</th>
              <th className='p-3 font-medium'>Total</th>
              <th className='p-3 font-medium'>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && bookings.length === 0 && (
              <tr><td colSpan={5} className='p-6 text-center text-gray-400'>No bookings yet.</td></tr>
            )}
            {bookings.map((booking) => (
              <tr key={booking._id} className='border-t border-bordercolor text-gray-500'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={booking.car?.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                  <p className='font-medium max-md:hidden'>{booking.car?.brand} {booking.car?.model}</p>
                </td>
                <td className='p-3 max-md:hidden'>{booking.user?.name}</td>
                <td className='p-3 max-md:hidden'>{booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}</td>
                <td className='p-3'>{currency}{booking.price}</td>
                <td className='p-3'>
                  {booking.status === 'cancelled' ? (
                    <span className='px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-500'>cancelled</span>
                  ) : (
                    <select value={booking.status} onChange={(e) => changeStatus(booking._id, e.target.value)} aria-label="Booking status" className='px-2 py-1.5 mt-1 text-gray-500 border border-bordercolor rounded-md outline-none'>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBookings
