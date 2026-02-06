import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminResponse } from '@/lib/authz';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import { apiSuccess, apiMessage, errors, calculatePagination } from '@/lib/apiResponse';
import { handleError, validateEmail, validateLength } from '@/lib/errorHandler';

/**
 * Contact Form API Route
 *
 * Handles public contact form submissions and admin message management.
 *
 * Security:
 * - POST: Public with strict rate limiting
 * - GET: Admin only
 * - PATCH: Admin only
 * - DELETE: Admin only
 */

/**
 * POST /api/contact
 * Stores a contact form submission
 *
 * Request body:
 * - name: Sender's name (required, max 100 chars)
 * - email: Sender's email (required, validated)
 * - message: The message content (required, max 5000 chars)
 *
 * Public endpoint with strict rate limiting (5 per hour)
 */
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for contact form
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.contact);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Validation
    if (!name?.trim()) {
      return errors.badRequest('Name is required');
    }
    validateLength(name, 'Name', { max: 100 });

    if (!email?.trim()) {
      return errors.badRequest('Email is required');
    }
    validateEmail(email);

    if (!message?.trim()) {
      return errors.badRequest('Message is required');
    }
    validateLength(message, 'Message', { min: 10, max: 5000 });

    // Store the message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim(),
      },
    });

    return apiMessage(
      'Thank you for your message. We will get back to you soon.',
      { id: contactMessage.id },
      201
    );
  } catch (error) {
    return handleError(error, 'contact:create');
  }
}

/**
 * GET /api/contact
 * Retrieves contact messages (admin only)
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Messages per page (default: 20)
 * - unreadOnly: Set to "true" to only show unread messages
 *
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.read);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const skip = (page - 1) * limit;
    const where = unreadOnly ? { read: false } : {};

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { read: false } }),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return apiSuccess({
      messages,
      unreadCount,
      pagination,
    });
  } catch (error) {
    return handleError(error, 'contact:list');
  }
}

/**
 * PATCH /api/contact
 * Marks a message as read
 *
 * Request body:
 * - id: Message ID to mark as read
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
    const { id, read = true } = body;

    if (!id) {
      return errors.badRequest('Message ID is required');
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });

    return apiSuccess({
      message,
    });
  } catch (error) {
    return handleError(error, 'contact:update');
  }
}

/**
 * DELETE /api/contact
 * Deletes a contact message
 *
 * Request body:
 * - id: Message ID to delete
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
    const { id } = body;

    if (!id) {
      return errors.badRequest('Message ID is required');
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return apiSuccess({
      deleted: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    return handleError(error, 'contact:delete');
  }
}
