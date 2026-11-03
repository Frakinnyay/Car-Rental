import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
   <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm text-gray-500'>
            <div className='flex flex-wrap justify-between  items-start gap-8 pb-6 border-bordercolor border-b'>
                <div>
                    <img src={assets.logo} alt="logo" className='h-8 md:h-9' />
                    <p className='max-w-80 mt-3'>
                        Premium car rental service with a wide selection of luxury and everyday vehicles for all your driving needs.
                    </p>
                    <div className='flex items-center gap-3 mt-6'>
                
                        <a href="#"><img src={assets.facebook_logo} alt="fb" className='w-5 h-5' /></a>
                        
                         <a href="#"><img src={assets.instagram_logo} alt="fb" className='w-5 h-5' /></a>
                       
                        <a href="#"><img src={assets.twitter_logo} alt="fb" className='w-5 h-5' /></a>
                        
                         <a href="#"><img src={assets.gmail_logo} alt="fb" className='w-5 h-5' /></a>
                       
                    </div>
                </div>

                 <div>
                    <p className='text-base font-medium text-gray-800 uppercase'>quick links</p>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/cars">Browse Cars</Link></li>
                        <li><a href="#">List Your Cars</a></li>
                        <li><a href="#">About us</a></li>
                    </ul>
                </div>
                <div>
                    <p className='text-base font-medium text-gray-800 uppercase'>Resources</p>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">terms Of Services</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Insurance</a></li>
                    </ul>
                </div>
                <div>
                    <p className='text-base font-medium text-gray-800 uppercase'>Contacts</p>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="#">1234 Luxuary Drives</a></li>
                        <li><a href="#">San Francisco, CA 94107</a></li>
                        <li><a href="#">+1 234 567890</a></li>
                        <li><a href="#">info@example.com</a></li>
                    </ul>
                </div>
            </div>
            
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} CarRental. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a></li>
                    <li>|</li>
                    <li><a href="#">Terms</a></li>
                    <li>|</li>
                    <li><a href="#">Cookies</a></li>
                </ul>
            </div>
        </div>
  )
}

export default Footer
