'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Ganesha from '@/app/pics/Ganesha.svg';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';

export default function NavBar() {
const [active, setActive] = useState('/home');
const navItems = [
    { id: '/home', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
   },
    { id: '/our-story', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
   },
   {
    id: '/post', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"/>
  </svg>
   },
   { id: '/event-schedule', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/>
      </svg>      
   },
   {
    id: '/best-wishes', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
    </svg>
   },
  ];

  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/home' && (pathname === '/' || pathname === '/home')) {
      return true;
    }
    return pathname === path;
  };

  const getLinkClass = (path: string) => {
    const baseClass = "relative px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ";
    const activeClass = "text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg transform scale-105";
    const inactiveClass = "text-gray-700 hover:text-purple-600 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400";
    
    return baseClass + (isActive(path) ? activeClass : inactiveClass);
  };

  return (
    <>
    <nav className="relative bg-white border-gray-200 dark:bg-gray-900 z-10">
      <div className="flex flex-wrap items-center justify-between p-4 z-10">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={Ganesha.src} alt="Ganesha" className="rounded-full" width={28} height={28} />
          <span className="text-md sm:text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold whitespace-nowrap italic font-[cursive]">|| Shree Ganeshay Namah ||</span>
        </Link>
        
          <ul className="hidden lg:flex font-medium space-x-4 ml-auto mr-4">
            <li>
              <Link href="/home" className={getLinkClass('/home')}>Home</Link>
            </li>
            <li>
              <Link href="/our-story" className={getLinkClass('/our-story')}>Our Story</Link>
            </li>
            <li>
              <Link href="/post" className={getLinkClass('/post')}>Upload Photos</Link>
            </li>
            <li>
              <Link href="/event-schedule" className={getLinkClass('/event-schedule')}>Event Schedule</Link>
            </li>
            <li>
              <Link href="/best-wishes" className={getLinkClass('/best-wishes')}>Best Wishes</Link>
            </li>
          </ul>

          <SignedOut>
            <div className="h-8 w-18 flex justify-center items-center bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 rounded-full">
              <span className="px-2 text-gray-700 bg-white dark:bg-gray-900 rounded-full"><SignInButton mode="modal" /></span>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
      </div>
    </nav>
  
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-50">
      <ul className="flex justify-between items-center px-4 py-3">
        {navItems.map(item => (
          <li
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`cursor-pointer text-gray-600 hover:text-black transition ${
              active === item.id ? 'text-black' : ''
            }`}
          >
            <Link href={item.id}>
                {item.icon}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
    </>
  );
}