'use client';

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

export default function SignInPopup() {
  const { openSignIn } = useClerk();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="min-h-[92dvh] bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main Card */}
      <div className="relative max-w-md w-full">
        {/* Floating Elements */}
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
        
        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center relative overflow-hidden">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Wedding Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                {/* Ring Animation */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-300 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full border border-pink-300 animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Join the Celebration
            </h2>

            {/* Subtitle */}
            <p className="text-gray-600 mb-2 text-lg font-medium">
              Share Your Beautiful Memories
            </p>

            {/* Description */}
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Sign in to upload photos, share moments, and be part of our special day. 
              Your memories make our celebration complete! ✨
            </p>

            {/* Features List */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Upload photos
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Share special moments
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Extend your best wishes to the Newlyweds
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={() => openSignIn()}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button Content */}
              <div className="relative flex items-center justify-center space-x-2">
                <svg className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In to Continue</span>
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
            </button>

            {/* Social Proof */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full border-2 border-white"></div>
              </div>
              <span>Join 50+ guests sharing memories</span>
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure sign-in powered by Clerk
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-6 left-4 w-1 h-1 bg-pink-300 rounded-full opacity-60"></div>
        </div>

        {/* Additional Floating Hearts */}
        <div className="absolute top-8 right-8 text-pink-300 opacity-20 animate-bounce delay-500">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        <div className="absolute bottom-1/4 -left-6 text-purple-300 opacity-15 animate-pulse delay-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}