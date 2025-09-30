'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownBox = () => {
  const router = useRouter();
  // Set event date (you can modify this to any future date)
  const eventDate = new Date('2025-12-05').getTime();
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isEventStarted, setIsEventStarted] = useState(false);
  const [isCountdownVisible, setIsCountdownVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = eventDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsEventStarted(false);
      } else {
        setIsEventStarted(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-lg min-w-[60px]">
        <span className="text-2xl font-bold text-gray-800 dark:text-white">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center" style={{ display: isCountdownVisible ? 'flex' : 'none' }}>
    <div className="max-w-md relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-xl p-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10 rounded-xl"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            🎉 Wedding Countdown
          </h2>
          <p className="text-blue-100 text-sm">
            Wedding Celebration
          </p>
        </div>

        {isEventStarted ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎊</div>
            <h3 className="text-2xl font-bold text-white mb-2">Event Started!</h3>
            <p className="text-blue-100">Join us for an amazing celebration!</p>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <TimeUnit value={timeLeft.days} label="Days" />
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <TimeUnit value={timeLeft.minutes} label="Minutes" />
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </div>
        )}

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/guest-list')} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-green-900 font-semibold py-2 px-6 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-20">
            RSVP
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-2 right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full blur-xl"></div>
      <div className="absolute bottom-2 left-2 w-16 h-16 bg-white bg-opacity-10 rounded-full blur-lg"></div>

      {/* Close Button */}
      <button onClick={() => setIsCountdownVisible(false)} className="absolute top-2 right-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    </div>
  );
};

export default CountdownBox;
