import { NextResponse } from 'next/server';

/**
 * Standardized API Response Utilities
 *
 * Provides consistent JSON response format across all API routes:
 * {
 *   success: boolean,
 *   data?: any,
 *   error?: string
 * }
 *
 * Benefits:
 * - Predictable response structure for frontend
 * - Consistent error handling
 * - Type-safe response creation
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a success response
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200,
  headers?: HeadersInit
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, headers }
  );
}

/**
 * Create an error response
 *
 * @param error - Error message
 * @param status - HTTP status code (default: 400)
 * @param headers - Additional headers
 */
export function apiError(
  error: string,
  status: number = 400,
  headers?: HeadersInit
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status, headers }
  );
}

/**
 * Create a success response with a message
 *
 * @param message - Success message
 * @param data - Optional additional data
 * @param status - HTTP status code (default: 200)
 */
export function apiMessage<T = undefined>(
  message: string,
  data?: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data !== undefined && { data }),
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const errors = {
  // 400 Bad Request
  badRequest: (message: string = 'Bad request') => apiError(message, 400),

  // 401 Unauthorized
  unauthorized: (message: string = 'Authentication required') =>
    apiError(message, 401),

  // 403 Forbidden
  forbidden: (message: string = 'Unauthorized: Admin access required') =>
    apiError(message, 403),

  // 404 Not Found
  notFound: (resource: string = 'Resource') =>
    apiError(`${resource} not found`, 404),

  // 405 Method Not Allowed
  methodNotAllowed: () => apiError('Method not allowed', 405),

  // 409 Conflict
  conflict: (message: string = 'Resource already exists') =>
    apiError(message, 409),

  // 413 Payload Too Large
  payloadTooLarge: (maxSize: string = '5MB') =>
    apiError(`Request body too large. Maximum size: ${maxSize}`, 413),

  // 422 Unprocessable Entity
  validationError: (message: string) => apiError(message, 422),

  // 429 Too Many Requests
  tooManyRequests: (retryAfterSeconds?: number) => {
    const headers: HeadersInit = {};
    if (retryAfterSeconds) {
      headers['Retry-After'] = String(retryAfterSeconds);
    }
    return apiError('Too many requests. Please try again later.', 429, headers);
  },

  // 500 Internal Server Error
  internal: (message: string = 'An unexpected error occurred') =>
    apiError(message, 500),

  // 503 Service Unavailable
  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    apiError(message, 503),
};

/**
 * Custom API Error class for throwing typed errors
 *
 * Usage:
 * ```ts
 * throw new ApiError('Validation failed', 422);
 * ```
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Convert to NextResponse
   */
  toResponse(): NextResponse<ApiResponse<never>> {
    return apiError(this.message, this.status);
  }
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Create a paginated success response
 */
export function apiPaginated<T>(
  data: T[],
  pagination: PaginationMeta,
  status: number = 200
): NextResponse<ApiResponse<{ items: T[]; pagination: PaginationMeta }>> {
  return apiSuccess({ items: data, pagination }, status);
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
