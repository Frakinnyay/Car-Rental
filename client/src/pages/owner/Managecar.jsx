import React, { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/useAppContext'
import { getErrorMessage } from '../../utils/errors'

const Managecar = () => {
  const { isOwner, axios, currency, fetchCars } = useAppContext()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchownerCars = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/owner/cars')
      if (data.success) setCars(data.cars)
      else toast.error(data.message)
    } catch (error) {
      if (error?.response?.status !== 401) toast.error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [axios])

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/api/owner/toggle-car', { carId })
      if (data.success) {
        toast.success(data.message)
        await fetchownerCars()
        fetchCars() // keep the public list in sync
      } else toast.error(data.message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const deleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to remove this car?')) return
    try {
      const { data } = await axios.post('/api/owner/delete-car', { carId })
      if (data.success) {
        toast.success(data.message)
        await fetchownerCars()
        fetchCars()
      } else toast.error(data.message)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  useEffect(() => {
    if (isOwner) fetchownerCars()
  }, [isOwner, fetchownerCars])

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title title="Manage cars" subTitle="View all listed cars, update their availability or remove them from the booking platform" />
      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-bordercolor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Category</th>
              <th className='p-3 font-medium'>Price</th>
              <th className='p-3 font-medium max-md:hidden'>Status</th>
              <th className='p-3 font-medium'>Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && cars.length === 0 && (
              <tr><td colSpan={5} className='p-6 text-center text-gray-400'>You have not listed any cars yet.</td></tr>
            )}
            {cars.map((car) => (
              <tr key={car._id} className='border-t border-bordercolor'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{car.brand} {car.model}</p>
                    <p className='text-sm text-gray-500'>{car.seating_capacity} seats • {car.transmission}</p>
                  </div>
                </td>
                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3'>{currency}{car.pricePerDay}/day</td>
                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${car.isAvailable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {car.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className='flex items-center p-3 gap-2'>
                  <button onClick={() => toggleAvailability(car._id)} aria-label={car.isAvailable ? 'Mark unavailable' : 'Mark available'} title={car.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                    <img src={car.isAvailable ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer' />
                  </button>
                  <button onClick={() => deleteCar(car._id)} aria-label="Delete car" title="Delete car">
                    <img src={assets.delete_icon} alt="" className='cursor-pointer' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Managecar
