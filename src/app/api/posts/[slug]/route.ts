import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { markdownToHtml, extractImageUrls, generateExcerpt, validateMarkdown } from '@/lib/markdown';
import { requireAdminResponse, isSessionAdmin } from '@/lib/authz';
import { rateLimitMiddleware, rateLimitPresets } from '@/lib/rateLimit';
import { apiSuccess, errors } from '@/lib/apiResponse';
import { handleError } from '@/lib/errorHandler';
import { getEnv } from '@/lib/env';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

/**
 * Single Post API Route
 *
 * Handles read, update, and delete operations for individual posts.
 *
 * Security:
 * - GET: Public for published posts, admin for drafts
 * - PATCH: Admin only
 * - DELETE: Admin only
 */

/**
 * GET /api/posts/[slug]
 * Retrieves a single post by its slug
 *
 * Public can view published posts.
 * Admin can view unpublished posts.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const rateLimit = rateLimitMiddleware(request, rateLimitPresets.read);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    const { slug } = await context.params;

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
      },
    });

    if (!post) {
      return errors.notFound('Post');
    }

    // If post is not published, require admin access
    if (!post.published) {
      const isAdmin = await isSessionAdmin();
      if (!isAdmin) {
        return errors.notFound('Post');
      }
    }

    // Convert markdown to HTML for rendering
    const contentHtml = await markdownToHtml(post.content);

    return apiSuccess({
      ...post,
      contentHtml,
    });
  } catch (error) {
    return handleError(error, 'posts:get');
  }
}

/**
 * PATCH /api/posts/[slug]
 * Updates an existing post
 *
 * Request body (all optional):
 * - title: New title
 * - content: New markdown content
 * - published: Update published status
 * - excerpt: Update excerpt
 * - thumbnail: Update thumbnail URL
 * - seoTitle: Update SEO title
 * - seoDesc: Update SEO description
 * - seoImage: Update OpenGraph image
 *
 * Admin only
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const rateLimit = rateLimitMiddleware(request, rateLimitPresets.write);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const { slug } = await context.params;
    const body = await request.json();
    const { title, content, published, excerpt, thumbnail, seoTitle, seoDesc, seoImage } = body;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return errors.notFound('Post');
    }

    // Build update data
    const updateData: {
      title?: string;
      content?: string;
      published?: boolean;
      excerpt?: string;
      thumbnail?: string | null;
      seoTitle?: string | null;
      seoDesc?: string | null;
      seoImage?: string | null;
    } = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return errors.badRequest('Title cannot be empty');
      }
      if (title.length > 200) {
        return errors.badRequest('Title must be 200 characters or less');
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      const contentIssues = validateMarkdown(content);
      if (contentIssues.length > 0) {
        return errors.validationError(`Invalid content: ${contentIssues.join(', ')}`);
      }
      updateData.content = content;

      // Auto-update excerpt if content changes and no explicit excerpt provided
      if (excerpt === undefined) {
        updateData.excerpt = generateExcerpt(content);
      }
    }

    if (published !== undefined) {
      updateData.published = Boolean(published);
    }

    if (excerpt !== undefined) {
      updateData.excerpt = excerpt;
    }

    if (thumbnail !== undefined) {
      updateData.thumbnail = thumbnail || null;
    }

    if (seoTitle !== undefined) {
      updateData.seoTitle = seoTitle || null;
    }

    if (seoDesc !== undefined) {
      updateData.seoDesc = seoDesc || null;
    }

    if (seoImage !== undefined) {
      updateData.seoImage = seoImage || null;
    }

    // Update post and sync images in a transaction
    const updatedPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { slug },
        data: updateData,
      });

      // If content was updated, sync the image references
      if (content !== undefined) {
        // Delete old image references
        await tx.postImage.deleteMany({
          where: { postId: post.id },
        });

        // Create new image references
        const imageUrls = extractImageUrls(content);
        if (imageUrls.length > 0) {
          await tx.postImage.createMany({
            data: imageUrls.map((url) => ({
              postId: post.id,
              url,
            })),
          });
        }
      }

      return post;
    });

    return apiSuccess({
      post: updatedPost,
      message: 'Post updated successfully',
    });
  } catch (error) {
    return handleError(error, 'posts:update');
  }
}

/**
 * DELETE /api/posts/[slug]
 * Deletes a post and all associated images
 *
 * Also deletes images from Cloudinary storage.
 *
 * Admin only
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const rateLimit = rateLimitMiddleware(request, rateLimitPresets.write);
    if (rateLimit.response) {
      return rateLimit.response;
    }

    // Admin authorization
    const auth = await requireAdminResponse();
    if (auth.error) {
      return auth.error;
    }

    const { slug } = await context.params;

    // Check if post exists and get image public IDs
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: {
        images: {
          select: { publicId: true },
        },
      },
    });

    if (!existingPost) {
      return errors.notFound('Post');
    }

    // Delete images from Cloudinary if configured
    const imagePublicIds = existingPost.images
      .map((img) => img.publicId)
      .filter((id): id is string => id !== null);

    if (imagePublicIds.length > 0 && getEnv('CLOUDINARY_CLOUD_NAME')) {
      try {
        cloudinary.config({
          cloud_name: getEnv('CLOUDINARY_CLOUD_NAME'),
          api_key: getEnv('CLOUDINARY_API_KEY'),
          api_secret: getEnv('CLOUDINARY_API_SECRET'),
        });

        await cloudinary.api.delete_resources(imagePublicIds);
      } catch (cloudinaryError) {
        // Log but don't fail the delete operation
        console.error('Failed to delete images from Cloudinary:', cloudinaryError);
      }
    }

    // Delete post (images cascade delete due to onDelete: Cascade)
    await prisma.post.delete({
      where: { slug },
    });

    return apiSuccess({
      deleted: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    return handleError(error, 'posts:delete');
  }
}
