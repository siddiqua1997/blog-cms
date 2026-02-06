import { cookies } from 'next/headers';
import prisma from './prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Authentication Library
 *
 * Session-based authentication for admin routes.
 * Uses secure cookies and database-backed sessions.
 */

const SESSION_COOKIE_NAME = 'toxic_session';
const SESSION_DURATION_DAYS = 7;

const BCRYPT_PREFIX = 'bcrypt$';
const BCRYPT_ROUNDS = 12;

// Password hashing
export function hashPassword(password: string): string {
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  return `${BCRYPT_PREFIX}${hash}`;
}

function verifyLegacyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

export function verifyPassword(password: string, storedHash: string): { valid: boolean; needsRehash: boolean } {
  if (storedHash.startsWith(BCRYPT_PREFIX)) {
    const bcryptHash = storedHash.slice(BCRYPT_PREFIX.length);
    return { valid: bcrypt.compareSync(password, bcryptHash), needsRehash: false };
  }

  const legacyValid = verifyLegacyPassword(password, storedHash);
  return { valid: legacyValid, needsRehash: legacyValid };
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

  const verification = verifyPassword(password, user.passwordHash);

  if (!verification.valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (verification.needsRehash) {
    const newHash = hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });
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
