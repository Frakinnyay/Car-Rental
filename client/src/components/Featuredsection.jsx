import React from 'react'
import { assets } from '../assets/assets'
import Carcard from './Carcard'
import Title from './Title'
import { useAppContext } from '../context/useAppContext'

const Featuredsection = () => {
  const { navigate, cars, carsLoading } = useAppContext()
  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div>
        <Title title='Featured Vehicles' subTitle="Select our premium luxury vehicles for your next journey" />
      </div>
      {!carsLoading && cars.length === 0 && (
        <p className='text-gray-500 mt-18'>No cars are listed yet. Check back soon!</p>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18'>
        {cars.slice(0, 6).map((car) => (
          <div key={car._id}>
            <Carcard car={car} />
          </div>
        ))}
      </div>
      <button onClick={() => { navigate('/cars'); scrollTo(0, 0) }} className='flex justify-center items-center gap-2 px-6 py-2 border border-bordercolor hover:bg-gray-50 rounded-md mt-18 cursor-pointer'>Explore all cars <img src={assets.arrow_icon} alt="arrow" /></button>
    </div>
  )
}

export default Featuredsection
