import { NextResponse, NextRequest } from 'next/server';
import { login } from '@/lib/auth';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.auth);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await login(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
