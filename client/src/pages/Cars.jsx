import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Title from '../components/Title'
import Loader from '../components/Loader'
import { assets } from '../assets/assets'
import Carcard from '../components/Carcard'
import { useAppContext } from '../context/useAppContext'
import { getErrorMessage } from '../utils/errors'

const Cars = () => {
  const { cars, carsLoading, axios, setPickUpDate, setReturnDate } = useAppContext()
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')
  const isDateSearch = Boolean(pickupLocation && pickupDate && returnDate)

  const [input, setInput] = useState(searchParams.get('q') || '')
  const [available, setAvailable] = useState([])
  const [searching, setSearching] = useState(isDateSearch)

  // Home-page search: ask the server which cars in that city are free for the dates.
  useEffect(() => {
    if (!isDateSearch) return
    let cancelled = false
    setPickUpDate(pickupDate)
    setReturnDate(returnDate)
    setSearching(true)
    axios
      .post('/api/booking/check-availablity', { location: pickupLocation, pickupDate, returnDate })
      .then(({ data }) => {
        if (cancelled) return
        if (data.success) setAvailable(data.availableCars)
        else toast.error(data.message)
      })
      .catch((error) => !cancelled && toast.error(getErrorMessage(error)))
      .finally(() => !cancelled && setSearching(false))
    return () => { cancelled = true }
  }, [isDateSearch, pickupLocation, pickupDate, returnDate, axios, setPickUpDate, setReturnDate])

  // Text filter: make, model, category, fuel, transmission, location.
  const visible = useMemo(() => {
    const base = isDateSearch ? available : cars
    const q = input.trim().toLowerCase()
    if (!q) return base
    return base.filter((car) =>
      [car.brand, car.model, car.category, car.fuel_type, car.transmission, car.location, car.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    )
  }, [isDateSearch, available, cars, input])

  const loading = isDateSearch ? searching : carsLoading

  return (
    <div>
      <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium vehicles available for your next adventure' />
        <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" aria-label="Filter cars" placeholder='Search by make, model or feature' className='w-full h-full outline-none text-gray-500' />
          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 mr-2' />
        </div>
      </div>
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        {isDateSearch && (
          <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto mb-2'>
            Free in <b>{pickupLocation}</b> from <b>{pickupDate}</b> to <b>{returnDate}</b> ·{' '}
            <Link to='/cars' className='text-primary'>Show all cars</Link>
          </p>
        )}
        {loading ? (
          <Loader />
        ) : (
          <>
            <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {visible.length} {visible.length === 1 ? 'car' : 'cars'}</p>
            {visible.length === 0 && (
              <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto mt-10'>No cars match your search.</p>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
              {visible.map((car) => (
                <div key={car._id}>
                  <Carcard car={car} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cars
