import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton for Serverless Environments
 *
 * Production-ready Prisma setup for Netlify/Vercel serverless functions.
 *
 * Key features:
 * - Singleton pattern prevents connection pool exhaustion
 * - Graceful error handling with typed errors
 * - Optimized logging for production vs development
 * - Connection pooling handled by Neon/Supabase
 *
 * Note: When using Neon or Supabase, they provide built-in connection pooling
 * via PgBouncer, which is essential for serverless environments where each
 * function invocation could otherwise create a new connection.
 */

// Extend globalThis to store Prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with environment-appropriate settings
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    // Production: Only log errors to reduce noise
    // Development: Log queries for debugging
    log:
      process.env.NODE_ENV === 'production'
        ? ['error']
        : ['query', 'error', 'warn'],
    // Customize error formatting
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  });
}

// Use existing instance or create new one
// In production, each serverless function gets its own instance
// In development, reuse across hot reloads
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Store in global only in development to survive hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Database Error Types
 * Use these to provide user-friendly error messages
 */
export enum DatabaseErrorCode {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface DatabaseError {
  code: DatabaseErrorCode;
  message: string;
  field?: string;
}

/**
 * Parse Prisma errors into user-friendly format
 *
 * Prisma error codes reference:
 * - P1001: Can't reach database server
 * - P1002: Database server timed out
 * - P2002: Unique constraint violation
 * - P2003: Foreign key constraint violation
 * - P2025: Record not found
 *
 * @param error - Error from Prisma operation
 * @returns Parsed database error with user-friendly message
 */
export function parsePrismaError(error: unknown): DatabaseError {
  // Handle Prisma-specific errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P1001':
      case 'P1002':
        return {
          code: DatabaseErrorCode.CONNECTION_ERROR,
          message: 'Database is temporarily unavailable. Please try again.',
        };

      case 'P2002':
        const field = prismaError.meta?.target?.[0];
        return {
          code: DatabaseErrorCode.UNIQUE_CONSTRAINT,
          message: field
            ? `A record with this ${field} already exists.`
            : 'This record already exists.',
          field,
        };

      case 'P2003':
        return {
          code: DatabaseErrorCode.FOREIGN_KEY_CONSTRAINT,
          message: 'Referenced record does not exist.',
        };

      case 'P2025':
        return {
          code: DatabaseErrorCode.NOT_FOUND,
          message: 'Record not found.',
        };

      default:
        // Log unknown Prisma errors for debugging
        console.error('Unknown Prisma error:', prismaError.code, error);
        return {
          code: DatabaseErrorCode.UNKNOWN,
          message: 'A database error occurred. Please try again.',
        };
    }
  }

  // Handle generic errors
  console.error('Non-Prisma database error:', error);
  return {
    code: DatabaseErrorCode.UNKNOWN,
    message: 'An unexpected error occurred.',
  };
}

/**
 * Check database connection health
 * Use this in health check endpoints
 *
 * @returns Promise resolving to connection status
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    const dbError = parsePrismaError(error);
    return {
      connected: false,
      error: dbError.message,
    };
  }
}

export default prisma;
