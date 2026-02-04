import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateExcerpt, extractImageUrls } from '@/lib/markdown';

/**
 * Admin Post API Routes
 *
 * These routes handle post operations by ID (rather than slug).
 * Used by the admin panel for CRUD operations.
 *
 * Security note: In production, add authentication middleware
 */

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/posts/[id]
 * Fetch a single post by ID for editing
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        images: {
          select: { id: true, url: true, altText: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/posts/[id]
 * Update a post by ID
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, content, published } = body;

    // Check post exists
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: {
      title?: string;
      content?: string;
      excerpt?: string;
      published?: boolean;
    } = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      updateData.content = content;
      updateData.excerpt = generateExcerpt(content);
    }

    if (published !== undefined) {
      updateData.published = Boolean(published);
    }

    // Update in transaction to sync images
    const post = await prisma.$transaction(async (tx) => {
      const updated = await tx.post.update({
        where: { id },
        data: updateData,
      });

      // Sync image references if content changed
      if (content !== undefined) {
        await tx.postImage.deleteMany({ where: { postId: id } });
        const imageUrls = extractImageUrls(content);
        if (imageUrls.length > 0) {
          await tx.postImage.createMany({
            data: imageUrls.map((url) => ({ postId: id, url })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      post,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id]
 * Delete a post by ID
 *
 * Note: Cascade delete handles images and comments (schema-defined)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Check post exists
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete post (images and comments cascade via schema)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
