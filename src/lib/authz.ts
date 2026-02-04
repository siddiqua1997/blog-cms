import { getSession } from './auth';
import { apiError, ApiError } from './apiResponse';

/**
 * Authorization Module
 *
 * Role-based access control for the blog CMS.
 * Currently implements single super-admin model.
 *
 * Architecture Decision:
 * - Only ONE admin: superadmin@toxictuning.com
 * - All admin actions check against this email
 * - Future: Can extend to role-based (admin, editor, viewer)
 *
 * Usage:
 * - API routes: Use requireAdmin() to protect endpoints
 * - Server components: Use isAdmin() for conditional rendering
 */

// The only admin email - configured via environment variable
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

/**
 * Get the current session user's email
 *
 * @returns User email if authenticated, null otherwise
 */
export async function getSessionUserEmail(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.user?.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if an email belongs to an admin
 *
 * Currently checks against single super-admin email.
 * Future: Could check against a roles table or admin list.
 *
 * @param email - Email to check
 * @returns true if email is an admin
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  if (!ADMIN_EMAIL) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if the current session user is an admin
 *
 * Use this in server components for conditional rendering:
 * ```tsx
 * if (await isSessionAdmin()) {
 *   // Show admin controls
 * }
 * ```
 *
 * @returns true if current user is admin
 */
export async function isSessionAdmin(): Promise<boolean> {
  const email = await getSessionUserEmail();
  return isAdmin(email);
}

/**
 * Require admin access - throws if not admin
 *
 * Use this at the start of admin-only API routes:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   await requireAdmin(); // Throws if not admin
 *   // ... admin-only logic
 * }
 * ```
 *
 * @throws ApiError with 401 or 403 status
 * @returns User info if authorized
 */
export async function requireAdmin(): Promise<{
  email: string;
  userId: string;
  name: string;
}> {
  const session = await getSession();

  // Not authenticated
  if (!session) {
    throw new ApiError('Authentication required', 401);
  }

  const { user } = session;

  // Authenticated but not admin
  if (!isAdmin(user.email)) {
    throw new ApiError('Unauthorized: Admin access required', 403);
  }

  return {
    email: user.email,
    userId: user.id,
    name: user.name,
  };
}

/**
 * Require admin access for API routes (returns Response on failure)
 *
 * Alternative to requireAdmin() that returns a Response instead of throwing.
 * Useful when you want to handle the response inline:
 *
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireAdminResponse();
 *   if (authResult.error) return authResult.error;
 *   // ... admin-only logic
 * }
 * ```
 *
 * @returns Object with either user info or error response
 */
export async function requireAdminResponse(): Promise<
  | { user: { email: string; userId: string; name: string }; error: null }
  | { user: null; error: Response }
> {
  try {
    const user = await requireAdmin();
    return { user, error: null };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        user: null,
        error: apiError(error.message, error.status),
      };
    }
    return {
      user: null,
      error: apiError('Unauthorized: Admin access required', 403),
    };
  }
}

/**
 * Admin-only actions reference
 *
 * These actions require admin authorization:
 * - Create post
 * - Edit post
 * - Delete post
 * - Upload images
 * - View contact messages
 * - Approve comments
 * - Delete comments
 *
 * Public actions (no auth required):
 * - View published blog posts
 * - Submit contact form
 * - Submit comments (stored as pending)
 */
export const ADMIN_ACTIONS = [
  'posts:create',
  'posts:edit',
  'posts:delete',
  'images:upload',
  'images:delete',
  'contacts:view',
  'contacts:delete',
  'comments:approve',
  'comments:reject',
  'comments:delete',
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];
