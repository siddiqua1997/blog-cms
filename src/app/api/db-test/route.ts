import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * GET /api/db-test
 * Database connection test - shows actual error message
 */
export async function GET() {
  const prisma = new PrismaClient();

  try {
    // Try to connect
    await prisma.$connect();

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    await prisma.$disconnect();

    return NextResponse.json({
      status: 'connected',
      result,
      dbUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    });
  } catch (error: unknown) {
    await prisma.$disconnect().catch(() => {});

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: string })?.code;

    return NextResponse.json({
      status: 'failed',
      error: errorMessage,
      code: errorCode,
      dbUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...',
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
