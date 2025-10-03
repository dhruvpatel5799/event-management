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
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
   },
    { id: '/guest-list', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" d="M4.5 17H4a1 1 0 0 1-1-1 3 3 0 0 1 3-3h1m0-3.05A2.5 2.5 0 1 1 9 5.5M19.5 17h.5a1 1 0 0 0 1-1 3 3 0 0 0-3-3h-1m0-3.05a2.5 2.5 0 1 0-2-4.45m.5 13.5h-7a1 1 0 0 1-1-1 3 3 0 0 1 3-3h3a3 3 0 0 1 3 3 1 1 0 0 1-1 1Zm-1-9.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
      </svg>
   },
   {
    id: '/post', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="24" height="24">
      <path d="M23,11H13V1a1,1,0,0,0-1-1h0a1,1,0,0,0-1,1V11H1a1,1,0,0,0-1,1H0a1,1,0,0,0,1,1H11V23a1,1,0,0,0,1,1h0a1,1,0,0,0,1-1V13H23a1,1,0,0,0,1-1h0A1,1,0,0,0,23,11Z"/>
    </svg>
    
   },
    { id: '/event-schedule', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/>
      </svg>      
   },
    { id: '/food-&-delicacies', icon: <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.011 13H20c-.367 2.5551-2.32 4.6825-4.9766 5.6162V20H8.97661v-1.3838C6.31996 17.6825 4.36697 15.5551 4 13h14.011Zm0 0c1.0995-.0059 1.989-.8991 1.989-2 0-.8637-.5475-1.59948-1.3143-1.87934M18.011 13H18m0-3.99997c.2409 0 .4718.04258.6857.12063m0 0c.8367-1.0335.7533-2.67022-.2802-3.50694-1.0335-.83672-2.5496-.6772-3.3864.35631-.293-1.50236-1.7485-2.15377-3.2509-1.8607-1.5023.29308-2.48263 1.74856-2.18956 3.25092C8.9805 6.17263 7.6182 5.26418 6.15462 6.00131 4.967 6.59945 4.45094 8.19239 5.04909 9.38002m0 0C4.37083 9.66467 4 10.3357 4 11.1174 4 12.1571 4.84288 13 5.88263 13m-.83354-3.61998c.2866-.12029 1.09613-.40074 2.04494.3418m5.27497-.89091c1.0047-.4589 2.1913-.01641 2.6502.98832"/>
      </svg>  
   },
  ];

  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && (pathname === '/' || pathname === '/home')) {
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
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 z-10">
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src={Ganesha.src} alt="Ganesha" className="rounded-full" width={28} height={28} />
          <span className="self-center text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold whitespace-nowrap dark:text-white">|| Shree Ganeshay Namah ||</span>
        </Link>
        

          <ul className="hidden lg:flex font-medium space-x-8 rtl:space-x-reverse">
            <li>
              <Link href="/home" className={getLinkClass('/home')}>Home</Link>
            </li>
            <li>
              <Link href="/our-story" className={getLinkClass('/our-story')}>Our Story</Link>
            </li>
            <li>
              <Link href="/guest-list" className={getLinkClass('/guest-list')}>RSVP</Link>
            </li>
            <li>
              <Link href="/event-schedule" className={getLinkClass('/event-schedule')}>Event Schedule</Link>
            </li>
            <li>
              <Link href="/food-&-delicacies" className={getLinkClass('/food-&-delicacies')}>Food & Delicacies</Link>
            </li>
          </ul>

          <SignedOut>
            <SignInButton mode="modal" />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
      </div>
    </nav>
  
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-50">
      <ul className="flex justify-between items-center px-6 py-3">
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