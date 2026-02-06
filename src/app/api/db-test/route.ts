import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdminResponse } from '@/lib/authz';

/**
 * GET /api/db-test
 * Database connection test - shows actual error message
 */
export async function GET() {
  const auth = await requireAdminResponse();
  if (auth.error) {
    return auth.error;
  }

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
    });
  } catch (error: unknown) {
    await prisma.$disconnect().catch(() => {});

    return NextResponse.json({
      status: 'failed',
      error: 'Database connection failed',
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
