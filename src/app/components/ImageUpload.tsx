'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { SignedIn } from '@clerk/nextjs';

interface UploadedImage {
  file: File;
  preview: string;
  id: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  fileName: string;
  fileSize: number;
}

export default function ImageUpload() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const duplicates: string[] = [];

    // Check for duplicates and create preview URLs for new files
    Array.from(files).forEach((file) => {
      const isDuplicate = uploadedImages.some(
        existingImg =>
          existingImg.fileName === file.name &&
          existingImg.fileSize === file.size
      );

      if (isDuplicate) {
        duplicates.push(file.name);
      } else {
        const preview = URL.createObjectURL(file);
        const id = Math.random().toString(36).substr(2, 9);
        newImages.push({
          file,
          preview,
          id,
          status: 'uploading',
          progress: 0,
          fileName: file.name,
          fileSize: file.size
        });
      }
    });

    // Show duplicate notification
    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
      setTimeout(() => setDuplicateFiles([]), 3000); // Clear after 3 seconds
    }

    // Reset file input to allow reselecting the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Only add new (non-duplicate) images
    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);

      // Upload files to Cloudinary one by one
      for (const imageData of newImages) {
        try {
          // Update progress to show upload starting
          setUploadedImages(prev =>
            prev.map(img =>
              img.id === imageData.id
                ? { ...img, progress: 10 }
                : img
            )
          );

          const formData = new FormData();
          formData.append('file', imageData.file);
          formData.append('public_id', process.env.NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID ?? '');
          formData.append('upload_preset', 'unsigned');
          formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? '');
          formData.append('timestamp', new Date().getTime().toString());

          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadedImages(prev =>
              prev.map(img =>
                img.id === imageData.id && img.progress! < 90
                  ? { ...img, progress: img.progress! + 10 }
                  : img
              )
            );
          }, 200);

          await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });

          clearInterval(progressInterval);

          // Mark as successful
          setUploadedImages(prev =>
            prev.map(img =>
              img.id === imageData.id
                ? { ...img, status: 'success', progress: 100 }
                : img
            )
          );

        } catch (error) {
          console.error('Upload failed:', error);

          // Mark as error
          setUploadedImages(prev =>
            prev.map(img =>
              img.id === imageData.id
                ? { ...img, status: 'error' }
                : img
            )
          );
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Clean up preview URL
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return updated;
    });
  };

  const retryUpload = async (id: string) => {
    const imageToRetry = uploadedImages.find(img => img.id === id);
    if (!imageToRetry) return;

    // Reset status to uploading
    setUploadedImages(prev =>
      prev.map(img =>
        img.id === id
          ? { ...img, status: 'uploading', progress: 0 }
          : img
      )
    );

    // Retry upload
    try {
      const formData = new FormData();
      formData.append('file', imageToRetry.file);
      formData.append('public_id', '8af5852bc4b426eb4914a950149868');
      formData.append('upload_preset', 'unsigned');
      formData.append('api_key', '646742571766164');
      formData.append('timestamp', new Date().getTime().toString());

      await fetch('https://api.cloudinary.com/v1_1/dnc9oimdm/image/upload', { method: 'POST', body: formData });

      setUploadedImages(prev =>
        prev.map(img =>
          img.id === id
            ? { ...img, status: 'success', progress: 100 }
            : img
        )
      );
    } catch (error) {
      setUploadedImages(prev =>
        prev.map(img =>
          img.id === id
            ? { ...img, status: 'error' }
            : img
        )
      );
      return error;
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isAnyUploading = uploadedImages.some(img => img.status === 'uploading');
  const successCount = uploadedImages.filter(img => img.status === 'success').length;
  const errorCount = uploadedImages.filter(img => img.status === 'error').length;

  return (
    <SignedIn>
      <div className="p-4">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Your Memories</h2>
            <p className="text-gray-600">Upload photos from the celebration</p>
          </div>

          {/* Duplicate Files Notification */}
          {duplicateFiles.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">
                    {duplicateFiles.length === 1 ? 'Duplicate file detected:' : 'Duplicate files detected:'}
                  </p>
                  <p className="text-yellow-700">
                    {duplicateFiles.join(', ')} {duplicateFiles.length === 1 ? 'is' : 'are'} already selected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Status Summary */}
          {uploadedImages.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  {isAnyUploading && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Uploading...
                    </div>
                  )}
                  {successCount > 0 && (
                    <div className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {successCount} uploaded
                    </div>
                  )}
                  {errorCount > 0 && (
                    <div className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {errorCount} failed
                    </div>
                  )}
                </div>
                <div className="text-gray-500">
                  {uploadedImages.length} total
                </div>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />

            {uploadedImages.length === 0 ? (
              <div className="space-y-4">
                {/* Upload Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Drag photos here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    or click to select from your device
                  </p>
                </div>

                <button
                  onClick={openFileDialog}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Select Photos
                </button>

                <p className="text-xs text-gray-400 mt-4">
                  Supports JPG, PNG, GIF up to 05MB each
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-600 font-medium">
                    {uploadedImages.length} photo{uploadedImages.length > 1 ? 's' : ''} selected
                  </span>
                </div>

                <button
                  onClick={openFileDialog}
                  disabled={isAnyUploading}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add more photos
                </button>
              </div>
            )}
          </div>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                      <Image
                        src={image.preview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />

                      {/* Upload Status Overlay */}
                      {image.status === 'uploading' && (
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-0.5 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                            <div className="text-xs">
                              {image.progress}%
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success Indicator */}
                      {image.status === 'success' && (
                        <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}

                      {/* Error Indicator */}
                      {image.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                          <button
                            onClick={() => retryUpload(image.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      disabled={image.status === 'uploading'}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-50 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* File Info with Status */}
                    <div className="mt-2 text-xs text-gray-500 truncate flex items-center">
                      <span className="flex-1 truncate">{image.fileName}</span>
                      {image.status === 'success' && (
                        <span className="ml-1 text-green-500">✓</span>
                      )}
                      {image.status === 'error' && (
                        <span className="ml-1 text-red-500">✗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
                    setUploadedImages([]);
                  }}
                  disabled={isAnyUploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>

                <button
                  disabled={isAnyUploading || successCount === 0}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300 font-semibold"
                >
                  {isAnyUploading ? 'Uploading...' : `Share ${successCount} Photo${successCount !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SignedIn>
  );
}