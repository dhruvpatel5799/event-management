'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import { getWishes } from '@/app/services/wishService';
import type { BestWish } from '@/app/utils/types';
import { uploadToCloudinary } from '@/app/services/imageService';
import WishCard from '@/app/components/WishCard';

export default function BestWishesWall() {
  const [wishes, setWishes] = useState<BestWish[]>([]);
  const [newWish, setNewWish] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();

  useEffect(() => {
    // TODO: Add pagination to the fetchWishes function
    // TODO: Add Lazy loading wherever necessary according to the scroll position especially for Images
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const wishes = await getWishes();
      setWishes(wishes);
    } catch (error) {
      console.error('Failed to fetch wishes:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWish.trim()) return;

    setIsSubmitting(true);
  
    try {
      let cloudinaryUrl: string | undefined = undefined;
      //let publicId: string | undefined = undefined;

      if (selectedImage) {
        const uploadResult = await uploadToCloudinary( selectedImage, 'best-wishes');

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Image upload failed');
        }

        cloudinaryUrl = uploadResult.url;
        //publicId = uploadResult.publicId;
      }
      
      const wishData = {
        text: newWish,
        author: authorName || user?.fullName || 'Anonymous',
        image_url: cloudinaryUrl,
        //image_public_id: publicId,
        image_filename: selectedImage?.name,
        image_size: selectedImage?.size,
      };

      const response = await fetch('/api/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wishData),
      });

      if (response.ok) {
        const data = await response.json();
        setWishes(prev => [data.wish, ...prev]);
        setNewWish('');
        setAuthorName('');
        setSelectedImage(null);
        setImagePreview(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create wish:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWish = (wishId: string) => {
    setWishes(prev => prev.filter(wish => wish.id !== wishId));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 pb-20 lg:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
            Best Wishes Wall
          </h1>
          <p className="text-xl md:text-2xl text-pink-100 mb-8">
            Share your love and blessings for the happy couple
          </p>
          
          {/* Floating Hearts Animation */}
          <div className="absolute top-4 left-4 text-pink-200 opacity-30 animate-bounce">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute top-8 right-8 text-pink-200 opacity-20 animate-bounce delay-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add New Wish Button */}
        <SignedIn>
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center mx-auto space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Share Your Wishes</span>
            </button>
          </div>

          {/* Wish Form */}
          {showForm && (
            <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border border-purple-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Best Wishes *
                  </label>
                  <textarea
                    value={newWish}
                    onChange={(e) => setNewWish(e.target.value)}
                    placeholder="Share your heartfelt wishes for the couple..."
                    className="w-full p-4 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={user?.fullName || "Enter your name"}
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a Photo (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 border-2 border-dashed border-purple-300 rounded-xl p-4 flex items-center space-x-2 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-purple-600 font-medium">Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <Image src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" width={64} height={64} />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newWish.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Wishes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </SignedIn>

        <SignedOut>
          <div className="mb-8 text-center bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <div className="text-purple-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Share Your Love</h3>
            <p className="text-gray-600 mb-6">Sign in to share your best wishes for the happy couple</p>
            <button onClick={() => openSignIn()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
              Sign In to Post
            </button>
          </div>
        </SignedOut>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishes.map((wish, index) => (
            <WishCard 
              key={wish.id} 
              wish={wish} 
              index={index}
              currentUserId={user?.id}
              isModerator={user?.publicMetadata?.role === 'moderator' || user?.publicMetadata?.role === 'admin'}
              onDelete={handleDeleteWish}
            />
          ))}
        </div>

        {/* Empty State */}
        {wishes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-purple-300 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No wishes yet</h3>
            <p className="text-gray-500">Be the first to share your best wishes!</p>
          </div>
        )}
      </div>

      <style jsx>{`        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .grid > div {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}