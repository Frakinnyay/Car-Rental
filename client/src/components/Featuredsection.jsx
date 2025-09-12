import React from 'react'
import { assets, dummyCarData } from '../assets/assets'
import Carcard from './Carcard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
const Featuredsection = () => {
  const navigate=useNavigate()
  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div>
        <Title title='Featured Vehicles' subTitle="Select our premium luxary vehicals for your next journey" />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18'>
        {
         dummyCarData.slice(0,6).map((car)=>
        (<div key={car._id}>
        <Carcard car={car}/>
        </div>
        ))
        }
      </div>
      <button  onClick={()=>{navigate('/cars'); scrollTo(0,0)}} className='flex  justify-center items-center gap-2 px-6 py-2 border border-bordercolor hover:bg-gray-50 rounded-md mt-18 cursor-pointer'>Explore all car <img src={assets.arrow_icon} alt="arrow" /></button>
    </div>
  )
}

export default Featuredsection
