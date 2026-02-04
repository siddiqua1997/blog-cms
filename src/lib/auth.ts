import { cookies } from 'next/headers';
import prisma from './prisma';
import crypto from 'crypto';

/**
 * Authentication Library
 *
 * Session-based authentication for admin routes.
 * Uses secure cookies and database-backed sessions.
 */

const SESSION_COOKIE_NAME = 'toxic_session';
const SESSION_DURATION_DAYS = 7;

// Simple password hashing using crypto (no external dependency)
// For production, consider using bcrypt or argon2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  // Set the session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

/**
 * Get the current session and user from cookies
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or not found
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    session,
    user: session.user,
  };
}

/**
 * Validate a user's credentials and create a session
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  const isValid = verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  await createSession(user.id);
  return { success: true };
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(): Promise<{ user: { id: string; email: string; name: string; role: string } }> {
  const session = await getSession();

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  };
}

/**
 * Create an admin user (for initial setup)
 */
export async function createAdminUser(email: string, password: string, name: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = hashPassword(password);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'admin',
    },
  });
}
