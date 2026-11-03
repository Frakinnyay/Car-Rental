import React, { useEffect } from 'react'
import Navbarowner from '../../components/owner/Navbarowner'
import Sidebar from '../../components/owner/Sidebar'
import Loader from '../../components/Loader'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/useAppContext'

const Layout = () => {
  const { isOwner, authLoading, navigate } = useAppContext()
  // Wait for the stored session to be verified, otherwise a page refresh on /owner
  // would bounce the owner to the home page before the user has loaded.
  useEffect(() => {
    if (!authLoading && !isOwner) navigate('/')
  }, [authLoading, isOwner, navigate])

  if (authLoading || !isOwner) return <Loader />
  return (
    <div className='flex flex-col'>
      <Navbarowner />
      <div className='flex'>
        <Sidebar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
