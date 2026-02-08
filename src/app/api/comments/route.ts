import { NextRequest } from 'next/server';
import { CommentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requireAdminResponse } from '@/lib/authz';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import { apiSuccess, apiMessage, errors, calculatePagination } from '@/lib/apiResponse';
import { handleError, validateLength, validateEmail } from '@/lib/errorHandler';
import { checkSpam, sanitizeComment } from '@/lib/spamFilter';

/**
 * Comments API Route
 *
 * Handles public comment submission and admin moderation.
 *
 * Security:
 * - POST: Public (with spam filtering and rate limiting)
 * - GET: Public for approved comments, admin for all
 * - PATCH: Admin only (for approval/rejection)
 * - DELETE: Admin only
 *
 * Workflow:
 * 1. User submits comment
 * 2. Spam filter checks content
 * 3. If spam detected → status = SPAM
 * 4. If clean → status = PENDING
 * 5. Admin reviews and approves → approved = true
 */

/**
 * POST /api/comments
 * Submit a new comment on a post
 *
 * Request body:
 * - postId: ID of the post to comment on (required)
 * - name: Commenter's name (required, max 100 chars)
 * - email: Commenter's email (optional)
 * - content: Comment text (required, max 2000 chars)
 *
 * Public endpoint with rate limiting and spam filtering
 */
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for comment submissions
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.comment);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const body = await request.json();
    const { postId, name, email, content } = body;

    // Validation
    if (!postId) {
      return errors.badRequest('Post ID is required');
    }

    if (!name?.trim()) {
      return errors.badRequest('Name is required');
    }
    validateLength(name, 'Name', { max: 100 });

    if (email) {
      validateEmail(email);
    }

    if (!content?.trim()) {
      return errors.badRequest('Comment content is required');
    }
    validateLength(content, 'Comment', { min: 10, max: 2000 });

    // Verify post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true },
    });

    if (!post) {
      return errors.notFound('Post');
    }

    if (!post.published) {
      return errors.badRequest('Cannot comment on unpublished posts');
    }

    // Run spam filter
    const spamResult = checkSpam({
      name: name.trim(),
      email: email?.trim(),
      content: content.trim(),
    });

    // Sanitize content before storing
    const sanitizedContent = sanitizeComment(content.trim());

    // Create comment with spam filter result
    const comment = await prisma.comment.create({
      data: {
        postId,
        name: name.trim(),
        email: email?.trim() || null,
        content: sanitizedContent,
        status: spamResult.status,
        approved: false, // Always requires manual approval
      },
    });

    // Different response message based on spam status
    if (spamResult.status === 'SPAM') {
      // Don't tell user it was flagged as spam (prevents gaming)
      return apiMessage(
        'Thank you for your comment. It will appear after review.',
        { id: comment.id },
        201
      );
    }

    return apiMessage(
      'Comment submitted successfully. It will appear after approval.',
      { id: comment.id },
      201
    );
  } catch (error) {
    return handleError(error, 'comments:create');
  }
}

/**
 * GET /api/comments
 * Get comments for a post
 *
 * Query params:
 * - postId: Post ID (required)
 * - includeUnapproved: Include pending/rejected comments (admin only)
 * - page: Page number (default: 1)
 * - limit: Comments per page (default: 20)
 *
 * Public: Only approved comments
 * Admin: All comments with moderation status
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.read);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    // If requesting unapproved comments, verify admin access
    if (includeUnapproved) {
      const auth = await requireAdminResponse();
      if (auth.error) {
        return auth.error;
      }
    }

    // Build where clause
    const where: { postId?: string; approved?: boolean } = {};
    if (postId) {
      where.postId = postId;
    }
    if (!includeUnapproved) {
      where.approved = true;
    }

    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where,
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
        ...(includeUnapproved && {
          email: true,
          approved: true,
          status: true,
        }),
      },
      orderBy: { createdAt: includeUnapproved ? 'desc' : 'asc' },
      skip,
      take: limit,
    });

    const total = includeUnapproved
      ? await prisma.comment.count({ where })
      : comments.length + (comments.length === limit ? 1 : 0) + skip;

    const pagination = calculatePagination(page, limit, total);

    return apiSuccess({ comments, pagination });
  } catch (error) {
    return handleError(error, 'comments:list');
  }
}

/**
 * PATCH /api/comments
 * Moderate a comment (approve/reject)
 *
 * Request body:
 * - id: Comment ID (required)
 * - approved: Boolean (optional)
 * - status: 'APPROVED' | 'REJECTED' | 'SPAM' (optional)
 *
 * Admin only
 */
export async function PATCH(request: NextRequest) {
  try {
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.write);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const { id, approved, status } = body;

    if (!id) {
      return errors.badRequest('Comment ID is required');
    }

    // Build update data with proper Prisma types
    const updateData: { approved?: boolean; status?: CommentStatus } = {};

    if (typeof approved === 'boolean') {
      updateData.approved = approved;
      // If approving, also update status
      if (approved) {
        updateData.status = CommentStatus.APPROVED;
      }
    }

    if (status && ['APPROVED', 'REJECTED', 'SPAM', 'PENDING'].includes(status)) {
      updateData.status = status as CommentStatus;
      // If status is APPROVED, also set approved flag
      if (status === 'APPROVED') {
        updateData.approved = true;
      } else if (status === 'REJECTED' || status === 'SPAM') {
        updateData.approved = false;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errors.badRequest('No valid fields to update');
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        approved: true,
        status: true,
      },
    });

    return apiSuccess({
      comment,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    return handleError(error, 'comments:update');
  }
}

/**
 * DELETE /api/comments
 * Delete a comment
 *
 * Request body:
 * - id: Comment ID (required)
 * - ids: Array of comment IDs (for bulk delete)
 *
 * Admin only
 */
export async function DELETE(request: NextRequest) {
  try {
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.write);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();
    const { id, ids } = body;

    if (ids && Array.isArray(ids)) {
      // Bulk delete
      const result = await prisma.comment.deleteMany({
        where: { id: { in: ids } },
      });

      return apiSuccess({
        deleted: result.count,
        message: `${result.count} comment(s) deleted`,
      });
    }

    if (!id) {
      return errors.badRequest('Comment ID is required');
    }

    await prisma.comment.delete({
      where: { id },
    });

    return apiSuccess({
      deleted: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    return handleError(error, 'comments:delete');
  }
}
