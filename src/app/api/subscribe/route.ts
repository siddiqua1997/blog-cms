import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import { apiMessage, errors } from '@/lib/apiResponse';
import { handleError, validateEmail } from '@/lib/errorHandler';

/**
 * Newsletter Subscription API Route
 *
 * Handles email subscriptions from the footer subscribe form.
 * Ready for future integration with Mailchimp, SendGrid, or other services.
 *
 * Security:
 * - POST: Public with rate limiting
 * - Validates email format server-side
 * - Prevents duplicate subscriptions
 */

/**
 * POST /api/subscribe
 * Subscribes an email to the newsletter
 *
 * Request body:
 * - email: Subscriber's email (required, validated)
 *
 * Public endpoint with rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting to prevent abuse
    const rateLimit = rateLimitMiddleware(request, rateLimitPresets.contact);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const body = await request.json();
    const { email } = body;

    // Validate email is provided
    if (!email?.trim()) {
      return errors.badRequest('Email is required');
    }

    // Validate email format
    const normalizedEmail = email.toLowerCase().trim();
    try {
      validateEmail(normalizedEmail);
    } catch {
      return errors.badRequest('Please enter a valid email address');
    }

    // Check for existing subscription
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingSubscriber) {
      // Return success even for existing subscribers (don't reveal if email exists)
      return apiMessage(
        'Thanks for subscribing! You\'ll receive our latest updates.',
        { subscribed: true },
        200
      );
    }

    // Create new subscriber
    const subscriber = await prisma.subscriber.create({
      data: {
        email: normalizedEmail,
      },
    });

    // TODO: Future integration point for email services
    // - Mailchimp: Add to list via API
    // - SendGrid: Add to contacts
    // - Send welcome email

    return apiMessage(
      'Thanks for subscribing! You\'ll receive our latest updates.',
      { id: subscriber.id, subscribed: true },
      201
    );
  } catch (error) {
    return handleError(error, 'subscribe:create');
  }
}
