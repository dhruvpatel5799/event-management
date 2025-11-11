import { memo, useCallback, useState } from "react";
import { BestWish } from "../utils/types";
import Image from "next/image";
import { deleteWish, updateWish } from "../services/wishService";
import { generateThumbnailUrl } from "@/app/services/galleryService";

interface WishCardProps {
  wish: BestWish;
  index: number;
  currentUserId?: string;
  isModerator?: boolean;
  onDelete?: (wishId: string) => void;
  onUpdate?: (wishId: string, updatedWish: BestWish) => void;
}

export default memo(function WishCard({ 
  wish, 
  index, 
  currentUserId = '',
  isModerator = false,
  onDelete,
  onUpdate
}: WishCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editText, setEditText] = useState(wish.text);
  const [editAuthor, setEditAuthor] = useState(wish.author);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Check if current user can delete/edit this wish
  const canDelete = currentUserId && (currentUserId === wish.user_id || isModerator);
  const canEdit = currentUserId && currentUserId === wish.user_id;

  const isWishEdited = useCallback((wish: BestWish) => {
    if (!wish.updated_at || !wish.created_at) return false;
    
    // Convert to timestamps for reliable comparison
    const createdTime = new Date(wish.created_at).getTime();
    const updatedTime = new Date(wish.updated_at).getTime();
    
    // Consider edited if updated more than 1 second after creation
    return updatedTime - createdTime > 1000;
  }, []);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this wish?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWish(wish.id);
      
      // Call parent callback to update UI
      if (onDelete) {
        onDelete(wish.id);
      }
    } catch (error) {
      console.error('Failed to delete wish:', error);
      alert('Failed to delete wish. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(wish.text);
    setEditAuthor(wish.author);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(wish.text);
    setEditAuthor(wish.author);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editAuthor.trim()) {
      alert('Both message and author name are required.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedWish = await updateWish(wish.id, {
        text: editText.trim(),
        author: editAuthor.trim()
      });

      // Call parent callback to update UI
      if (onUpdate) {
        onUpdate(wish.id, updatedWish);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update wish:', error);
      alert('Failed to update wish. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

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
        {/* Action Buttons - Desktop */}
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canEdit && !isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200"
              title="Edit wish"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg transition-all duration-200"
              title="Delete wish"
            >
              {isDeleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Image Section */}
        {wish.image_url && (
          <div className="relative h-100 bg-gray-100">
            <Image
              src={generateThumbnailUrl(wish.image_url, { width: 400, height: 400 })}
              alt="Wish image"
              fill
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
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={4}
                placeholder="Enter your wish..."
              />
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Your name"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editText.trim() || !editAuthor.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-800 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                {wish.text}
              </p>
              
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-purple-600">
                  - {wish.author}
                </span>
                <span className="text-gray-500">
                  {formatDate(wish.created_at)}
                  {isWishEdited(wish) && (
                    <span className="ml-1 text-gray-400">(Edited)</span>
                  )}
                </span>
              </div>
            </>
          )}
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
            <p className="text-gray-500 text-xs">
              {formatDate(wish.created_at)}
              {isWishEdited(wish) && (
                <span className="ml-1 text-gray-400">(Edited)</span>
              )}
            </p>
          </div>
          
          {/* Action Buttons - Mobile */}
          <div className="flex gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-all duration-200"
                title="Edit wish"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-md transition-all duration-200"
                title="Delete wish"
              >
                {isDeleting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
        {/* Image */}
        {wish.image_url && (
          <div className="relative aspect-square">
            <Image
              src={generateThumbnailUrl(wish.image_url, { width: 400, height: 400 })}
              alt="Wish image"
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            />
          </div>
        )}
        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={4}
                placeholder="Enter your wish..."
              />
              <input
                type="text"
                value={editAuthor}
                onChange={(e) => setEditAuthor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                placeholder="Your name"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editText.trim() || !editAuthor.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
              {wish.text} <br />
              <span className="font-semibold">- {wish.author}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});