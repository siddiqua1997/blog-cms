/**
 * Shared TypeScript types for the Blog CMS
 *
 * These types are used across the application for consistency
 * and can be extended as the application grows.
 */

// Re-export Prisma types for convenience
export type { Post, PostImage, ContactMessage } from '@prisma/client';

/**
 * Post with rendered HTML content
 * Used when fetching a single post for display
 */
export type PostWithHtml = {
  id: string;
  title: string;
  slug: string;
  content: string;
  contentHtml: string; // Rendered markdown
  excerpt: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
};

/**
 * Post summary for listing pages
 */
export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    images: number;
  };
};

/**
 * Pagination metadata
 */
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * API Response types
 */
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PostsListResponse = {
  posts: PostSummary[];
  pagination: Pagination;
};

export type PostResponse = PostWithHtml;

export type UploadResponse = {
  url: string;
  publicId: string;
  message?: string;
  fileInfo?: {
    name: string;
    type: string;
    size: number;
  };
};

export type ContactResponse = {
  success: boolean;
  message: string;
  id?: string;
};

/**
 * Form data types for creating/updating posts
 */
export type CreatePostData = {
  title: string;
  content: string;
  published?: boolean;
  excerpt?: string;
};

export type UpdatePostData = Partial<CreatePostData>;

/**
 * Contact form submission
 */
export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};
