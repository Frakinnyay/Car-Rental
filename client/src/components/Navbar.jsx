import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate,} from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'
import toast from "react-hot-toast";

// fuckin remeber this max-sm used for smaller screen and sm used for larger screen
// if you had define property for whole this can be overwritten with for larger screen using max-sm and in smaller screen using sm  this is different screen sithe with decreasing size layouts xl>lg>md
// gap is an css flex box property to use it you shuld first use the flex property



const Navbar = () => {
  const{setShowLogin,user,logout,isOwner,axios,setIsOwner}=useAppContext()
  const location =useLocation()
  const [open ,setOpen]=useState(false)
  const navigate =useNavigate()
  const changerole=async()=>{
    try {
      const {data}=await axios.post('api/owner/change-role')
      if(data.success)
      {
        setIsOwner(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className={`flex items-center justify-between px-6 md:px-16 lg:px-32 xl:px-24 py-5 text-gray-600 border-b border-bordercolor relative transition-all ${location.pathname ==="/" && "bg-light"}`}>
      <Link to='/'>
       <img src={assets.logo} alt="logo" className='h-8'/>
      </Link>
      <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:border-t border:bordercolor right:0 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/"? "bg-light":"bg-white"} ${open ? "max-sm:translate-x-0" :"max-sm:translate-x-full"}`}>
        {menuLinks.map((link,index)=>(
         <Link key={index} to={link.path}>{link.name}</Link>
        ))}
        {/* This is my input search with button */}
         {/* <div className={`flex items-center border border-bordercolor rounded-full px-3 `}>
          <input type="text" placeholder='search' className={`py-1.5 px-1.5 outline-0`}/>
          <img src={assets.search_icon} alt="search"/>
        </div> */}
        <div className='hidden lg:flex item-center text-sm gap-2 border border-bordercolor px-3 rounded-full max-w-56'>
          <input type="text" className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 placeholder:none" />
          <img src={assets.search_icon} alt="search" />
        </div>
        {/* This was written by me obeviously watching tutorial gap is flex property  what am I lacking is not the tailwind but the responsiveness of the website 
        <div className="flex  gap-6">
          <button className='cursor-pointer'>Dashboard</button>
          <button className=' bg-primary cursor-pointer px-8 py-2 text-white  rounded-lg hover:bg-primary-dull'>Login</button>
        </div> */}
        <div className="flex max-sm:flex-col item-start sm:item-center gap-6">
          <button onClick={()=>isOwner ? navigate('/owner'):changerole()} className='cursor-pointer'>{ isOwner ?'Dashboard':'ListCars'}</button>
          <button onClick={()=> {user ?logout():setShowLogin(true)}} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg">{user ?'Logout':'Login'}</button>
        </div>
        </div>
        <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={()=>setOpen(!open)} ><img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
        </button>
    </div>
  )
}

export default Navbar
