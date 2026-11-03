import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/useAppContext'
import { getErrorMessage } from '../../utils/errors'

const Dashboard = () => {
  const { isOwner, currency, axios } = useAppContext()
  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.completedBookings, icon: assets.carIconColored },
  ]

  useEffect(() => {
    if (!isOwner) return
    let cancelled = false
    axios
      .get('/api/owner/dashboard')
      .then(({ data }) => {
        if (cancelled) return
        if (data.success) setData(data.dashboardData)
        else toast.error(data.message)
      })
      .catch((error) => !cancelled && error?.response?.status !== 401 && toast.error(getErrorMessage(error)))
    return () => { cancelled = true }
  }, [isOwner, axios])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including cars, bookings, revenue and recent bookings" />
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-3xl gap-6 my-8'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-bordercolor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold text-black'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* recent bookings */}
        <div className='p-4 md:p-6 border border-bordercolor rounded-md max-w-lg w-full'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest Customer Bookings</p>
          {data.recentBookings.length === 0 && <p className='mt-4 text-sm text-gray-400'>No bookings yet.</p>}
          {data.recentBookings.map((booking) => (
            <div key={booking._id} className='mt-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                  <img src={assets.listIconColored} alt="" className='h-5 w-5' />
                </div>
                <div>
                  <p>{booking.car?.brand} {booking.car?.model}</p>
                  <p className='text-sm text-gray-500'>{booking.createdAt.split('T')[0]}</p>
                </div>
              </div>
              <div className='flex items-center gap-2 font-medium'>
                <p className='text-sm text-gray-500'>{currency}{booking.price}</p>
                <p className='px-3 py-0.5 border border-bordercolor rounded-full text-sm capitalize'>{booking.status}</p>
              </div>
            </div>
          ))}
        </div>
        {/* revenue */}
        <div className='p-4 md:p-6 border border-bordercolor rounded-md w-full md:max-w-xs'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Confirmed bookings made this month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>{currency}{data.monthlyRevenue}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
