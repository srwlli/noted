// services/images.ts
import { supabase } from '@/lib/supabase';

// TypeScript interfaces for type safety
export interface UploadImageResult {
  publicUrl: string;
  filePath: string;
  fileName: string;
}

export interface UploadImageOptions {
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  quality?: number;
}

// Custom error class for better error handling
export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code: 'FILE_TOO_LARGE' | 'INVALID_EXTENSION' | 'UPLOAD_FAILED' | 'NETWORK_ERROR' | 'INVALID_URL',
    public originalError?: any
  ) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export const imagesService = {
  /**
   * Upload image to Supabase Storage
   * @param imageUri - Local file URI from image picker
   * @param userId - Current user's ID
   * @returns Upload result with public URL, file path, and file name
   */
  async uploadImage(imageUri: string, userId: string): Promise<UploadImageResult> {
    try {
      // Convert URI to blob for upload
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new ImageUploadError('Failed to fetch image', 'NETWORK_ERROR');
      }
      const blob = await response.blob();

      // Validate file extension from blob MIME type (more reliable than URI)
      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
      };

      const fileExt = mimeToExt[blob.type];
      if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
        throw new ImageUploadError(
          `Invalid image format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
          'INVALID_EXTENSION'
        );
      }

      // Check file size (5MB limit)
      if (blob.size > 5242880) {
        throw new ImageUploadError('Image must be less than 5MB', 'FILE_TOO_LARGE');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const fileName = `${timestamp}_${randomString}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('note-images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('note-images')
        .getPublicUrl(filePath);

      return {
        publicUrl,
        filePath,
        fileName
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  },

  /**
   * Delete image from Supabase Storage
   * @param imageUrl - Full public URL of image
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/note-images/[userId]/[filename]
      const urlParts = imageUrl.split('/note-images/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid image URL format');
      }
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('note-images')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Image deletion failed:', error);
      throw error;
    }
  }
};
