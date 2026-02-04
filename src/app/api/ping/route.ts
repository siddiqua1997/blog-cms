import { NextResponse } from 'next/server';

/**
 * GET /api/ping
 * Simple ping endpoint - no database required
 * Use this to verify serverless functions are working
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
    },
  });
}

export const dynamic = 'force-dynamic';
