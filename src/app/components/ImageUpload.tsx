'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { SignedIn } from '@clerk/nextjs';
import { uploadToCloudinary, cleanupObjectUrl, ImageMetadata } from '@/app/services/imageService';

import MosaicGrid from './MosaicGrid';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  fileName: string;
  fileSize: number;
  optimizedSize?: number;
  metadata?: ImageMetadata;
  url?: string;
  error?: string;
}

interface ImageUploadProps {
  maxFiles?: number;
  acceptedFormats?: string[];
}

export default function ImageUpload({ 
  maxFiles = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg', 'image/svg+xml'],
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refreshGridTrigger, setRefreshGridTrigger] = useState(0);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(img => {
        if (img.preview) {
          cleanupObjectUrl(img.preview);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateImageStatus = useCallback((id: string, updates: Partial<UploadedImage>) => {
    setUploadedImages(prev => 
      prev.map(img => img.id === id ? { ...img, ...updates } : img)
    );
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    // Check file limits
    if (uploadedImages.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - uploadedImages.length} more files.`);
      return;
    }

    const newImages: UploadedImage[] = [];
    const duplicates: string[] = [];
    const invalidFiles: string[] = [];

    // Process each file
    Array.from(files).forEach((file) => {
      // Check for duplicates
      const isDuplicate = uploadedImages.some(
        existingImg =>
          existingImg.fileName === file.name &&
          existingImg.fileSize === file.size
      );

      if (isDuplicate) {
        duplicates.push(file.name);
        return;
      }

      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        invalidFiles.push(`${file.name} (unsupported format)`);
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
        return;
      }

      // Create image entry
      const preview = URL.createObjectURL(file);
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      newImages.push({
        id,
        file,
        preview,
        status: 'pending',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
      });
    });

    // Show notifications
    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
      setTimeout(() => setDuplicateFiles([]), 4000);
    }

    if (invalidFiles.length > 0) {
      alert(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    // Add valid images and start upload process
    if (newImages.length > 0) {
      setUploadedImages(prev => [...prev, ...newImages]);
      setIsUploading(true);
      
      // Process uploads
      await Promise.all(newImages.map(imageData => uploadSingleImage(imageData)));
      
      setIsUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedImages, maxFiles, acceptedFormats]);

  const uploadSingleImage = useCallback(async (imageData: UploadedImage) => {
    try {
      updateImageStatus(imageData.id, { 
        status: 'uploading', 
        progress: 10 
      });

      // Step 1: Upload directly to Cloudinary (upload preset handles optimization)
      const uploadResult = await uploadToCloudinary(imageData.file);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      updateImageStatus(imageData.id, { 
        status: 'uploading', 
        progress: 50,
        url: uploadResult.url,
        optimizedSize: uploadResult.optimizedSize,
        error: undefined
      });

      // Step 2: Save image data to supabase
      const imageMetadata = {
        image_url: uploadResult.url,
        public_id: uploadResult.publicId,
      }

      const response = await fetch('/api/images', {
        method: 'POST',
        body: JSON.stringify(imageMetadata),
      });

      if (!response.ok) {
        throw new Error('Failed to save image metadata');
      }

      updateImageStatus(imageData.id, {
        status: 'success',
        progress: 100,
        url: uploadResult.url,
        error: undefined
      })
      setRefreshGridTrigger(prev => prev + 1);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateImageStatus(imageData.id, { 
        status: 'error', 
        progress: 0,
        error: errorMessage 
      });
    }
  }, [updateImageStatus]);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files) return;
    await processFiles(files);
  }, [processFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
  }, [handleFileChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.preview) {
        cleanupObjectUrl(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const retryUpload = useCallback(async (id: string) => {
    const imageToRetry = uploadedImages.find(img => img.id === id);
    if (!imageToRetry) return;

    updateImageStatus(id, { status: 'pending', progress: 0, error: undefined });
    await uploadSingleImage(imageToRetry);
  }, [uploadedImages, updateImageStatus, uploadSingleImage]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearAllImages = useCallback(() => {
    uploadedImages.forEach(img => {
      if (img.preview) {
        cleanupObjectUrl(img.preview);
      }
    });
    setUploadedImages([]);
  }, [uploadedImages]);

  // Computed values
  const isAnyProcessing = uploadedImages.some(img => 
    ['pending', 'uploading'].includes(img.status)
  );
  const successCount = uploadedImages.filter(img => img.status === 'success').length;
  const errorCount = uploadedImages.filter(img => img.status === 'error').length;
  const totalSizeReduction = uploadedImages.reduce((acc, img) => {
    if (img.optimizedSize && img.fileSize > img.optimizedSize) {
      return acc + (img.fileSize - img.optimizedSize);
    }
    return acc;
  }, 0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SignedIn>
      <div className="p-4 mb-12">
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
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center space-x-4">
                  {isAnyProcessing && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing...
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
                  {uploadedImages.length}/{maxFiles} files
                </div>
              </div>
              {totalSizeReduction > 0 && (
                <div className="text-xs text-green-600 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Saved {formatFileSize(totalSizeReduction)} through optimization
                </div>
              )}
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
                  Supports JPG, PNG, GIF up to 10MB each
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
                  disabled={isAnyProcessing || uploadedImages.length >= maxFiles}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadedImages.length >= maxFiles ? 'Maximum files reached' : 'Add more photos'}
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
                      {['pending', 'uploading'].includes(image.status) && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                            <div className="text-xs font-medium">
                              {image.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </div>
                            <div className="text-xs opacity-75">
                              {image.progress}%
                            </div>
                            {image.status === 'uploading' && image.fileSize < 2 * 1024 * 1024 && (
                              <div className="text-xs opacity-75 mt-1">
                                Original quality preserved
                              </div>
                            )}
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
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex flex-col items-center justify-center p-2">
                          <div className="text-xs text-red-800 text-center mb-2 font-medium">
                            {image.error || 'Upload failed'}
                          </div>
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
                      disabled={['uploading'].includes(image.status)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-50 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* File Info with Status */}
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{image.fileName}</span>
                        {image.status === 'success' && (
                          <span className="ml-1 text-green-500">✓</span>
                        )}
                        {image.status === 'error' && (
                          <span className="ml-1 text-red-500">✗</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>{formatFileSize(image.fileSize)}</span>
                        {image.optimizedSize && image.optimizedSize < image.fileSize && (
                          <span className="text-green-600">
                            → {formatFileSize(image.optimizedSize)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={clearAllImages}
                  disabled={isAnyProcessing}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>

                <button
                  disabled={isAnyProcessing || uploadedImages.length >= maxFiles}
                  onClick={openFileDialog}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300 font-semibold"
                >
                  {uploadedImages.length >= maxFiles ? 'Maximum Reached' : 'Upload More'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add the UserImageGrid component below */}
        <div className="max-w-4xl mx-auto">
          <MosaicGrid 
            refreshTrigger={refreshGridTrigger}
            onImageDeleted={() => setRefreshGridTrigger(prev => prev + 1)}
          />
        </div>
      </div>
    </SignedIn>
  );
}