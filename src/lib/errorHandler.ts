import { NextResponse } from 'next/server';
import { ApiError, apiError, ApiResponse } from './apiResponse';
import { parsePrismaError, DatabaseErrorCode } from './prisma';

/**
 * Centralized Error Handler
 *
 * Converts various error types into consistent API responses.
 * Use this to wrap route handlers for automatic error handling.
 *
 * Features:
 * - Handles ApiError instances
 * - Parses Prisma/database errors
 * - Logs errors appropriately
 * - Never exposes internal details in production
 */

/**
 * Handle an error and return appropriate API response
 *
 * @param error - The caught error
 * @param context - Optional context for logging (e.g., route name)
 * @returns NextResponse with error details
 */
export function handleError(
  error: unknown,
  context?: string
): NextResponse<ApiResponse<never>> {
  // Known API errors - return as-is
  if (error instanceof ApiError) {
    return error.toResponse();
  }

  // Check for Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = parsePrismaError(error);

    // Map database error codes to HTTP status codes
    const statusMap: Record<DatabaseErrorCode, number> = {
      [DatabaseErrorCode.CONNECTION_ERROR]: 503,
      [DatabaseErrorCode.UNIQUE_CONSTRAINT]: 409,
      [DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT]: 400,
      [DatabaseErrorCode.NOT_FOUND]: 404,
      [DatabaseErrorCode.VALIDATION_ERROR]: 422,
      [DatabaseErrorCode.UNKNOWN]: 500,
    };

    const status = statusMap[dbError.code] || 500;

    // Log the actual error for debugging
    console.error(`[${context || 'API'}] Database error:`, {
      code: dbError.code,
      message: dbError.message,
      field: dbError.field,
    });

    return apiError(dbError.message, status);
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Log the full error in all environments for debugging
    console.error(`[${context || 'API'}] Error:`, error.message, error.stack);

    // In production, hide internal error details
    if (process.env.NODE_ENV === 'production') {
      return apiError('An unexpected error occurred. Please try again.', 500);
    }

    // In development, show error message
    return apiError(error.message, 500);
  }

  // Unknown error types
  console.error(`[${context || 'API'}] Unknown error:`, error);
  return apiError('An unexpected error occurred.', 500);
}

/**
 * Wrapper for API route handlers with automatic error handling
 *
 * Usage:
 * ```ts
 * export const POST = withErrorHandler(async (request) => {
 *   // Your handler logic - errors are automatically caught
 *   const data = await someOperation();
 *   return apiSuccess(data);
 * }, 'posts:create');
 * ```
 */
export function withErrorHandler<T>(
  handler: (request: Request, context?: unknown) => Promise<NextResponse<T>>,
  routeContext?: string
): (request: Request, context?: unknown) => Promise<NextResponse<T | ApiResponse<never>>> {
  return async (request: Request, context?: unknown) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, routeContext);
    }
  };
}

/**
 * Validation helper - throws ApiError on failure
 *
 * Usage:
 * ```ts
 * validateRequired({ title, content }, ['title', 'content']);
 * ```
 */
export function validateRequired(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(
    (field) =>
      data[field] === undefined ||
      data[field] === null ||
      (typeof data[field] === 'string' && data[field].trim() === '')
  );

  if (missing.length > 0) {
    throw new ApiError(
      `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
      400
    );
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  field: string,
  { min, max }: { min?: number; max?: number }
): void {
  if (min !== undefined && value.length < min) {
    throw new ApiError(`${field} must be at least ${min} characters`, 400);
  }
  if (max !== undefined && value.length > max) {
    throw new ApiError(`${field} must be no more than ${max} characters`, 400);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Invalid email format', 400);
  }
}

/**
 * Parse and validate request body with size limit
 *
 * @param request - The request object
 * @param maxSizeBytes - Maximum body size in bytes (default: 1MB)
 */
export async function parseBody<T = Record<string, unknown>>(
  request: Request,
  maxSizeBytes: number = 1024 * 1024 // 1MB default
): Promise<T> {
  // Check content length header
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSizeBytes) {
    throw new ApiError(
      `Request body too large. Maximum size: ${Math.round(maxSizeBytes / 1024)}KB`,
      413
    );
  }

  try {
    const body = await request.json();
    return body as T;
  } catch {
    throw new ApiError('Invalid JSON in request body', 400);
  }
}
