import React, { useState } from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/useAppContext'

// On small screens the menu slides in from the right (max-sm = below the sm breakpoint).
const Navbar = () => {
  const { setShowLogin, user, logout, isOwner, becomeOwner } = useAppContext()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/cars?q=${encodeURIComponent(q)}` : '/cars')
    setOpen(false)
  }

  return (
    <div className={`flex items-center justify-between px-6 md:px-16 lg:px-32 xl:px-24 py-5 text-gray-600 border-b border-bordercolor relative transition-all ${location.pathname === "/" && "bg-light"}`}>
      <Link to='/'>
       <img src={assets.logo} alt="logo" className='h-8'/>
      </Link>
      <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 max-sm:right-0 max-sm:border-t max-sm:border-bordercolor flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 max-sm:p-4 transition-all duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
        {menuLinks.map((link, index) => (
         <Link key={index} to={link.path} onClick={() => setOpen(false)}>{link.name}</Link>
        ))}
        <form onSubmit={onSearch} className='hidden lg:flex items-center text-sm gap-2 border border-bordercolor px-3 rounded-full max-w-56'>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search cars" placeholder="Search cars" className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" />
          <button type="submit" aria-label="Search"><img src={assets.search_icon} alt="" /></button>
        </form>
        <div className="flex max-sm:flex-col items-start sm:items-center gap-6">
          <button onClick={() => { setOpen(false); becomeOwner() }} className='cursor-pointer'>{isOwner ? 'Dashboard' : 'List cars'}</button>
          <button onClick={() => { setOpen(false); user ? logout() : setShowLogin(true) }} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition-all text-white rounded-lg">{user ? 'Logout' : 'Login'}</button>
        </div>
      </div>
      <button className='sm:hidden cursor-pointer' aria-label="Menu" onClick={() => setOpen(!open)}>
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </div>
  )
}

export default Navbar
