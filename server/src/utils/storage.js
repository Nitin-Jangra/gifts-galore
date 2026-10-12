import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES };

/**
 * Storage Service for Gifts Galore media assets
 */
export class StorageService {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'gifts-galore-media';
  }

  /**
   * Upload an image buffer to storage with randomized UUID
   */
  async uploadImage(fileBuffer, originalFilename, mimeType) {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      const err = new Error(`File format ${mimeType} is not allowed. Only JPEG, PNG, and WebP images are permitted.`);
      err.statusCode = 400;
      throw err;
    }

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      const err = new Error('File exceeds maximum allowable size of 5MB.');
      err.statusCode = 400;
      throw err;
    }

    const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp';
    const randomizedKey = `products/${crypto.randomUUID()}.${extension}`;

    // If Supabase credentials configured and not in test environment, upload to Supabase Storage
    if (
      this.supabaseUrl &&
      this.serviceRoleKey &&
      !this.supabaseUrl.includes('mock') &&
      process.env.NODE_ENV !== 'test'
    ) {
      const uploadEndpoint = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${randomizedKey}`;
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.serviceRoleKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true',
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to upload asset to Supabase Storage: ${text}`);
      }

      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${randomizedKey}`;
      return {
        key: randomizedKey,
        url: publicUrl,
      };
    }

    // Local / Test mock URL with secure randomized identifier
    const localUrl = `/uploads/${randomizedKey}`;
    return {
      key: randomizedKey,
      url: localUrl,
    };
  }
}

export default new StorageService();
