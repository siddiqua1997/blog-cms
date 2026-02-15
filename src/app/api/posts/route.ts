import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slugify';
import { generateExcerpt, extractImageUrls, validateMarkdown } from '@/lib/markdown';
import { requireAdminResponse } from '@/lib/authz';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import {
  apiSuccess,
  apiError,
  errors,
} from '@/lib/apiResponse';
import { handleError, validateRequired } from '@/lib/errorHandler';
import { appCache } from '@/lib/lru';
import { revalidatePath } from 'next/cache';

type CacheEntry = {
  timestamp: number;
  payload: ReturnType<typeof apiSuccess>;
};

const CACHE_TTL_MS = 600_000;
const responseCache = new Map<string, CacheEntry>();

/**
 * Posts API Route
 *
 * Handles CRUD operations for blog posts.
 *
 * Security:
 * - GET: Public for published posts, admin for all
 * - POST: Admin only
 * - Rate limited
 *
 * Performance:
 * - Uses ISR (Incremental Static Regeneration) on public pages
 * - Efficient pagination with cursor-based queries
 */

/**
 * GET /api/posts
 * Retrieves blog posts with pagination
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 10, max: 50)
 * - includeUnpublished: Include drafts (admin only)
 *
 * Public: Only published posts
 * Admin: All posts including drafts
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting - relaxed for reads
    const rateLimit = await rateLimitMiddleware(request, rateLimitPresets.read);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';
    const q = (searchParams.get('q') || '').trim();

    // If requesting unpublished posts, verify admin access
    if (includeUnpublished) {
      const auth = await requireAdminResponse();
      if (auth.error) {
        return auth.error;
      }
    }

    const skip = (page - 1) * limit;
    const cacheKey = `${page}:${limit}:${q || 'all'}`;

    if (!includeUnpublished) {
      const cached = responseCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.payload;
      }
    }
    const where: {
      published?: boolean;
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; excerpt?: { contains: string; mode: 'insensitive' } }>;
    } = includeUnpublished ? {} : { published: true };

    if (q.length >= 2) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        thumbnail: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const response = apiSuccess({
      posts,
    });
    if (!includeUnpublished) {
      responseCache.set(cacheKey, { timestamp: Date.now(), payload: response });
    }

    return response;
  } catch (error) {
    return handleError(error, 'posts:list');
  }
}

/**
 * POST /api/posts
 * Creates a new blog post
 *
 * Request body:
 * - title: Post title (required)
 * - content: Markdown content (required)
 * - published: Boolean (default: false)
 * - excerpt: Optional excerpt (auto-generated if not provided)
 * - thumbnail: Optional thumbnail URL
 * - seoTitle: Optional SEO title
 * - seoDesc: Optional SEO description
 * - seoImage: Optional OpenGraph image
 *
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - moderate for writes
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
    const {
      title,
      content,
      published = false,
      excerpt,
      thumbnail,
      seoTitle,
      seoDesc,
      seoImage,
    } = body;

    // Validate required fields
    validateRequired({ title, content }, ['title', 'content']);

    // Validate title
    if (typeof title !== 'string' || title.trim().length === 0) {
      return errors.badRequest('Title must be a non-empty string');
    }

    if (title.length > 200) {
      return errors.badRequest('Title must be 200 characters or less');
    }

    // Validate content
    if (typeof content !== 'string') {
      return errors.badRequest('Content must be a string');
    }

    // Validate markdown content
    const contentIssues = validateMarkdown(content);
    if (contentIssues.length > 0) {
      return apiError(`Invalid content: ${contentIssues.join(', ')}`, 400);
    }

    // Generate unique slug from title
    const slug = await generateUniqueSlug(title, async (testSlug) => {
      const existing = await prisma.post.findUnique({
        where: { slug: testSlug },
        select: { id: true },
      });
      return existing !== null;
    });

    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt || generateExcerpt(content);

    // Extract image URLs from markdown for tracking
    const imageUrls = extractImageUrls(content);

    // Create post with associated images in a transaction
    const post = await prisma.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: {
          title: title.trim(),
          slug,
          content,
          excerpt: finalExcerpt,
          published,
          thumbnail: thumbnail || null,
          seoTitle: seoTitle || null,
          seoDesc: seoDesc || null,
          seoImage: seoImage || null,
        },
      });

      // Track images embedded in the markdown
      if (imageUrls.length > 0) {
        await tx.postImage.createMany({
          data: imageUrls.map((url) => ({
            postId: newPost.id,
            url,
          })),
        });
      }

      return newPost;
    });

    // Invalidate blog caches so new posts appear immediately
    appCache.delete('blog-list:1:9');
    appCache.delete('blog-list:1:10');
    appCache.delete('blog-list:1:12');
    responseCache.clear();

    if (published) {
      revalidatePath('/blog');
      revalidatePath(`/blog/${slug}`);
    }

    return apiSuccess(
      {
        post,
        message: 'Post created successfully',
      },
      201
    );
  } catch (error) {
    return handleError(error, 'posts:create');
  }
}
