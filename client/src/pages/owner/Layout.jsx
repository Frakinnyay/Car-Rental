import React, { useEffect } from 'react'
import Navbarowner from '../../components/owner/Navbarowner'
import Sidebar from '../../components/owner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
  const {isOwner,navigate}=useAppContext();
  useEffect(()=>{
    if(!isOwner)
    {
      navigate('/')
    }
  },[isOwner])
  return (
    <div className='flex flex-col'>
    <Navbarowner/>
    <div className='flex'>
      <Sidebar/>
      <Outlet/>  
    </div>      
    </div>
  )
}

export default Layout
