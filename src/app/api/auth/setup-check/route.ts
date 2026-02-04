import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force dynamic rendering - this endpoint checks database state
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ setupAvailable: userCount === 0 });
  } catch (error) {
    console.error('Setup check error:', error);
    // If database is unavailable, assume setup might be needed
    return NextResponse.json({ setupAvailable: true });
  }
}
