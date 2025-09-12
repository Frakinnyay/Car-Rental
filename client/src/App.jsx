import React, { useState } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Cars from './pages/Cars'
import Cardetails from './pages/Cardetails'
import Mybookings from './pages/Mybookings'
import Footer from './components/Footer'
import Login from './components/Login'
import Dashboard from './pages/owner/Dashboard'
import Managecar from './pages/owner/Managecar'
import ManageBookings from './pages/owner/ManageBookings'
import Layout from './pages/owner/Layout'
import Addcar from './pages/owner/Addcar'
import {Toaster} from 'react-hot-toast'
import { useAppContext } from './context/AppContext'

const App = () => {
  const {showLogin}=useAppContext()
  const isownerpath=useLocation().pathname.startsWith('/owner')
  return (
    <>
    <Toaster/>
     {showLogin && <Login/>}
      
      {!isownerpath &&<Navbar/>}

      <Routes>
       <Route path='/' element={<Home/>}/>
       <Route path='/Cardetails/:id' element={<Cardetails/>}/>       
       <Route path='/my-bookings' element={<Mybookings/>}/>       
       <Route path='/Cars' element={<Cars/>}/>
       {/* these routings ofr owner */}
       {/* always remember the file name of react is always start with capital letter */}
       <Route path='/owner' element={<Layout/>}>
       <Route index element={<Dashboard/>}/>
       <Route path='add-car' element={<Addcar/>}/>
       <Route path='manage-cars' element={<Managecar/>}/>
       <Route path='manage-bookings' element={<ManageBookings/>}/>
       </Route>
      </Routes>

      {!isownerpath && <Footer/>}
    </>
  )
}

export default App
