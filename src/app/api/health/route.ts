import { checkDatabaseConnection } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/apiResponse';

/**
 * GET /api/health
 * Health check endpoint for monitoring and deployment verification
 *
 * Used by:
 * - Netlify for deployment health checks
 * - Uptime monitoring services
 * - Manual verification
 *
 * Returns:
 * - status: "healthy" or "unhealthy"
 * - database: connection status with latency
 * - timestamp: server time
 * - version: app version from package.json
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  // Check database connection
  const dbStatus = await checkDatabaseConnection();

  if (!dbStatus.connected) {
    return apiError(
      'Service unhealthy: Database connection failed',
      503
    );
  }

  return apiSuccess({
    status: 'healthy',
    database: {
      connected: dbStatus.connected,
      latencyMs: dbStatus.latencyMs,
    },
    timestamp,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
}

// Prevent caching of health check
export const dynamic = 'force-dynamic';
export const revalidate = 0;
