import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdminResponse } from '@/lib/authz';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import { apiSuccess, apiError, errors, ApiError } from '@/lib/apiResponse';
import { handleError } from '@/lib/errorHandler';
import { getEnv } from '@/lib/env';

/**
 * Image Upload API Route
 *
 * Handles image uploads to Cloudinary for blog posts and thumbnails.
 *
 * Security:
 * - Admin-only access
 * - Rate limited (10 uploads/minute)
 * - File type validation
 * - File size limit (5MB)
 *
 * Production Notes:
 * - Images are stored in Cloudinary with automatic optimization
 * - Public IDs are returned for future deletion
 * - Responsive image URLs available via Cloudinary transformations
 */

// Configuration for allowed uploads
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure Cloudinary
// Note: These are read at runtime, not build time
function configureCloudinary() {
  cloudinary.config({
    cloud_name: getEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: getEnv('CLOUDINARY_API_KEY'),
    api_secret: getEnv('CLOUDINARY_API_SECRET'),
    secure: true,
  });
}

function toCloudinaryApiError(error: unknown): ApiError {
  const err = error as { http_code?: number; message?: string };
  const status = err.http_code && err.http_code >= 400 && err.http_code < 600 ? err.http_code : 502;
  const baseMessage = err.message || 'Cloudinary request failed';

  if (process.env.NODE_ENV === 'production') {
    if (status === 401 || status === 403) {
      return new ApiError('Cloudinary authentication failed. Check API key/secret.', 502);
    }
    return new ApiError('Image upload failed. Please try again.', 502);
  }

  return new ApiError(baseMessage, status);
}

/**
 * POST /api/upload
 * Upload an image to Cloudinary
 *
 * Request: multipart/form-data with 'file' field
 * Optional: 'folder' field for organization (default: 'blog')
 *
 * Response:
 * - url: Public URL of the uploaded image
 * - publicId: Cloudinary public ID for management
 * - width/height: Image dimensions
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for uploads
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.upload);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'blog';

    // Validate file presence
    if (!file) {
      return errors.badRequest('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError(
        `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
        400
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errors.payloadTooLarge('5MB');
    }

    // Check Cloudinary configuration
    const cloudName = getEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey = getEnv('CLOUDINARY_API_KEY');
    const apiSecret = getEnv('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials not configured');
      return errors.serviceUnavailable('Image upload service not configured');
    }

    // Configure Cloudinary
    configureCloudinary();

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          // Automatic quality optimization
          quality: 'auto',
          // Generate responsive breakpoints for efficient delivery
          responsive_breakpoints: {
            create_derived: true,
            bytes_step: 20000,
            min_width: 200,
            max_width: 1920,
          },
        },
        (error, result) => {
          if (error) {
            reject(toCloudinaryApiError(error));
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('No result from Cloudinary'));
          }
        }
      );
      uploadStream.end(buffer);
    });

    return apiSuccess(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
      201
    );
  } catch (error) {
    return handleError(error, 'upload:create');
  }
}

/**
 * DELETE /api/upload
 * Delete an image from Cloudinary
 *
 * Request body:
 * - publicId: The Cloudinary public ID of the image to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.write);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const { publicId } = body;

    if (!publicId || typeof publicId !== 'string') {
      return errors.badRequest('publicId is required');
    }

    // Check Cloudinary configuration
    if (!getEnv('CLOUDINARY_CLOUD_NAME')) {
      return errors.serviceUnavailable('Image upload service not configured');
    }

    // Configure Cloudinary
    configureCloudinary();

    // Delete from Cloudinary
    let result;
    try {
      result = await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw toCloudinaryApiError(error);
    }

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.error('Cloudinary delete failed:', result);
      return errors.internal('Failed to delete image');
    }

    return apiSuccess({
      deleted: true,
      publicId,
    });
  } catch (error) {
    return handleError(error, 'upload:delete');
  }
}
