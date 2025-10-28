import { memo, useCallback } from "react";
import { BestWish } from "../utils/types";
import Image from "next/image";

export default memo(function WishCard({ wish, index }: { wish: BestWish; index: number }) {
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div
      key={index}
      className={`group relative transform transition-all duration-500 hover:scale-105 ${
        index % 4 === 0 ? 'md:rotate-1' : 
        index % 4 === 1 ? 'md:-rotate-1' : 
        index % 4 === 2 ? 'md:rotate-2' : 'md:-rotate-2'
      } hover:rotate-0`}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Desktop: Polaroid/Postcard Style */}
      <div className="hidden md:block bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-white">
        {/* Image Section */}
        {wish.image_url && (
          <div className="relative h-48 bg-gray-100">
            <Image
              src={wish.image_url}
              alt="Wish image"
              fill
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            />
            {/* Vintage Photo Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"></div>
          </div>
        )}
        
        {/* Content Section */}
        <div className={`p-4 ${wish.image_url ? 'bg-white' : 'bg-gradient-to-br from-purple-50 to-pink-50 min-h-[200px] flex flex-col justify-center'}`}>
          <p className="text-gray-800 text-sm leading-relaxed mb-3">
            {wish.text}
          </p>
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-purple-600">
              - {wish.author}
            </span>
            <span className="text-gray-500">
              {formatDate(wish.created_at)}
            </span>
          </div>
        </div>
        {/* Tape Effect */}
        <div className="absolute -top-2 left-4 w-16 h-6 bg-yellow-200 opacity-70 transform -rotate-12 shadow-sm"></div>
        <div className="absolute -top-2 right-4 w-16 h-6 bg-yellow-200 opacity-70 transform rotate-12 shadow-sm"></div>
      </div>
      {/* Mobile: Instagram Style */}
      <div className="md:hidden bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {wish.author.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1">
            <p className="font-semibold text-gray-900 text-sm">{wish.author}</p>
            <p className="text-gray-500 text-xs">{formatDate(wish.created_at)}</p>
          </div>
          
        </div>
        {/* Image */}
        {wish.image_url && (
          <div className="relative aspect-square">
            <Image
              src={wish.image_url || ''}
              alt="Wish image"
              fill
              className="object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            />
          </div>
        )}
        {/* Content */}
        <div className="p-4">
          <p className="text-gray-800 text-sm leading-relaxed">
            {wish.text} <br />
            <span className="font-semibold">- {wish.author}</span>
          </p>
        </div>
        {/* Actions */}
        <div className="px-4 pb-4 flex items-center space-x-4">
          <button className="text-purple-500 hover:text-purple-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});