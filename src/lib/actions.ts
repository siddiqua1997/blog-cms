'use server';

/**
 * Server Actions for Admin Operations
 *
 * Design decisions:
 * - Using Server Actions instead of API routes for form mutations
 * - Server Actions are colocated here for reusability across admin pages
 * - Each action handles its own validation and error handling
 * - Actions return consistent response shape for UI handling
 *
 * Security note: In production, wrap these with authentication checks
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { generateUniqueSlug } from '@/lib/slugify';
import { generateExcerpt, extractImageUrls } from '@/lib/markdown';

// ============================================================
// POST ACTIONS
// ============================================================

/**
 * Create a new post
 * Called from admin/posts/new form
 */
export async function createPost(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized: Admin access required' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';

  // Validation
  if (!title?.trim()) {
    return { error: 'Title is required' };
  }
  if (!content?.trim()) {
    return { error: 'Content is required' };
  }

  try {
    // Generate unique slug
    const slug = await generateUniqueSlug(title, async (testSlug) => {
      const existing = await prisma.post.findUnique({
        where: { slug: testSlug },
        select: { id: true },
      });
      return existing !== null;
    });

    // Create post with image tracking
    const imageUrls = extractImageUrls(content);

    await prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: title.trim(),
          slug,
          content,
          excerpt: generateExcerpt(content),
          published,
        },
      });

      if (imageUrls.length > 0) {
        await tx.postImage.createMany({
          data: imageUrls.map((url) => ({
            postId: post.id,
            url,
          })),
        });
      }
    });

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: 'Failed to create post' };
  }

  redirect('/admin/posts');
}

/**
 * Update an existing post
 * Called from admin/posts/[id]/edit form
 */
export async function updatePost(id: string, formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: 'Unauthorized: Admin access required' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const published = formData.get('published') === 'on';

  // Validation
  if (!title?.trim()) {
    return { error: 'Title is required' };
  }
  if (!content?.trim()) {
    return { error: 'Content is required' };
  }

  try {
    const imageUrls = extractImageUrls(content);

    await prisma.$transaction(async (tx) => {
      // Update post
      await tx.post.update({
        where: { id },
        data: {
          title: title.trim(),
          content,
          excerpt: generateExcerpt(content),
          published,
        },
      });

      // Sync image references
      await tx.postImage.deleteMany({ where: { postId: id } });
      if (imageUrls.length > 0) {
        await tx.postImage.createMany({
          data: imageUrls.map((url) => ({
            postId: id,
            url,
          })),
        });
      }
    });

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } catch (error) {
    console.error('Error updating post:', error);
    return { error: 'Failed to update post' };
  }

  redirect('/admin/posts');
}

/**
 * Delete a post
 * Cascade deletes associated images and comments (defined in schema)
 */
export async function deletePost(id: string): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  try {
    // Note: PostImage and Comment cascade delete is handled by Prisma schema
    // onDelete: Cascade ensures related records are automatically removed
    await prisma.post.delete({
      where: { id },
    });

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
  } catch (error) {
    console.error('Error deleting post:', error);
    // In form action context, we can't return errors - they need to be handled differently
  }
}

/**
 * Toggle post published status
 * Quick action from post list
 */
export async function togglePostPublished(id: string): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { published: true },
    });

    if (!post) {
      return;
    }

    await prisma.post.update({
      where: { id },
      data: { published: !post.published },
    });

    revalidatePath('/admin/posts');
    revalidatePath('/blog');
  } catch (error) {
    console.error('Error toggling post:', error);
  }
}

// ============================================================
// COMMENT ACTIONS
// ============================================================

/**
 * Approve or unapprove a comment
 * Design: Toggle pattern for easy moderation workflow
 */
export async function toggleCommentApproval(id: string): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { approved: true, postId: true },
    });

    if (!comment) {
      return;
    }

    await prisma.comment.update({
      where: { id },
      data: { approved: !comment.approved },
    });

    revalidatePath('/admin/comments');
    // Revalidate the specific post page to update comment visibility
    const post = await prisma.post.findUnique({
      where: { id: comment.postId },
      select: { slug: true },
    });
    if (post) {
      revalidatePath(`/blog/${post.slug}`);
    }
  } catch (error) {
    console.error('Error toggling comment:', error);
  }
}

/**
 * Delete a comment
 * Does not affect post integrity (no cascade up)
 */
export async function deleteComment(id: string): Promise<void> {
  try {
    await requireAdmin();
  } catch {
    return;
  }

  try {
    await prisma.comment.delete({
      where: { id },
    });

    revalidatePath('/admin/comments');
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

/**
 * Bulk approve comments
 * Useful for moderating multiple comments at once
 */
export async function bulkApproveComments(ids: string[]): Promise<void> {
  try {
    await prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: { approved: true },
    });

    revalidatePath('/admin/comments');
    revalidatePath('/blog');
  } catch (error) {
    console.error('Error bulk approving comments:', error);
  }
}

// ============================================================
// CONTACT MESSAGE ACTIONS
// ============================================================

/**
 * Delete a contact message
 */
export async function deleteContactMessage(id: string): Promise<void> {
  try {
    await prisma.contactMessage.delete({
      where: { id },
    });

    revalidatePath('/admin/contacts');
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}

/**
 * Mark contact message as read
 */
export async function markMessageAsRead(id: string): Promise<void> {
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });

    revalidatePath('/admin/contacts');
  } catch (error) {
    console.error('Error updating message:', error);
  }
}
