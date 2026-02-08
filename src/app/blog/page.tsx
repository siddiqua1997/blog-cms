import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { generateBlogListMetadata } from '@/lib/seo';
import { extractFirstImage } from '@/lib/seo';
import { isAllowedImageUrl } from '@/lib/images';
import type { Metadata } from 'next';

/**
 * Blog Listing Page
 *
 * Server component with:
 * - Direct DB access for performance
 * - ISR (Incremental Static Regeneration)
 * - SEO-optimized metadata
 * - Thumbnail support with fallback
 */

// Use SEO utility for consistent metadata
export const metadata: Metadata = generateBlogListMetadata();

// ISR: Revalidate every 60 seconds
export const revalidate = 60;
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1'));
  const q = (params.q || '').trim();
  const limit = 9;
  const skip = (page - 1) * limit;

  // Server component: Direct DB access
  // Handles database unavailability gracefully
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail: string | null;
    createdAt: Date;
    _count: { comments: number };
  }> = [];
  let total = 0;

  try {
    [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          ...(q.length >= 2
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { excerpt: { contains: q, mode: 'insensitive' } },
                  { content: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          thumbnail: true,
          createdAt: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          published: true,
          ...(q.length >= 2
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { excerpt: { contains: q, mode: 'insensitive' } },
                  { content: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      }),
    ]);
  } catch {
    // Database unavailable - continue with empty posts
  }

  const totalPages = Math.ceil(total / limit);

  // Helper to get post image (thumbnail or first image from content)
  const getPostImage = (post: { thumbnail: string | null; content: string }) => {
    if (post.thumbnail) return post.thumbnail;
    return extractFirstImage(post.content);
  };

  return (
    <>
      {/* Page Header - DARK */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-pure-black relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.4) 0%, transparent 70%)',
              top: '0%',
              right: '-10%',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Insights & Guides
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            The <span className="gradient-text-red">Blog</span>
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            Performance tuning insights, build showcases, and technical guides
            from our team of specialists.
          </p>

          <form action="/blog" method="get" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search posts..."
              className="w-full px-4 py-3 rounded-xl border border-grey-800 bg-pure-black/40 text-pure-white placeholder:text-grey-500 focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
            >
              Search
            </button>
            {q.length > 0 && (
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-grey-700 text-grey-200 hover:text-pure-white hover:border-grey-500 transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* Posts Grid - WHITE */}
      <section className="section-padding section-light">
        <div className="section-container">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-grey-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-grey-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-rich-black mb-3">
                {q.length > 0 ? `No results for \"${q}\"` : 'No posts yet'}
              </h2>
              <p className="text-grey-600 mb-8">
                {q.length > 0
                  ? 'Try a different search term or clear the search.'
                  : 'Check back soon for performance insights and build showcases!'}
              </p>
              <Link href="/" className="btn-secondary-dark">
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {posts.map((post, index) => {
                  const postImage = getPostImage(post);

                  return (
                    <article
                      key={post.id}
                      className="card-premium-light group opacity-0 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                    >
                      {/* Post thumbnail */}
                      <Link href={`/blog/${post.slug}`} className="block">
                        <div className="aspect-video bg-gradient-to-br from-grey-100 to-grey-200 relative overflow-hidden">
                          {postImage ? (
                            isAllowedImageUrl(postImage) ? (
                              <Image
                                src={postImage}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <img
                                src={postImage}
                                alt={post.title}
                                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-16 h-16 text-grey-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                              </svg>
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-red-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="px-4 py-2 bg-rich-black/80 backdrop-blur-sm rounded-full text-pure-white text-sm font-medium">
                              Read Article
                            </span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-6">
                        {/* Meta info */}
                        <div className="flex items-center gap-3 text-sm text-grey-500 mb-4">
                          <time dateTime={post.createdAt.toISOString()}>
                            {post.createdAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                          {post._count.comments > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-grey-400" />
                              <span>{post._count.comments} comments</span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-rich-black mb-3 group-hover:text-red-primary transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h2>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-grey-600 line-clamp-2 mb-6">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Read more link */}
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 text-red-primary font-medium group/link"
                        >
                          Read More
                          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-4 mt-16" aria-label="Pagination">
                  {page > 1 && (
                    <Link
                      href={`/blog?page=${page - 1}`}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-grey-300 text-grey-600 hover:border-red-primary hover:text-red-primary transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Link>
                  )}

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`/blog?page=${pageNum}`}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          pageNum === page
                            ? 'bg-red-primary text-pure-white'
                            : 'text-grey-600 hover:text-rich-black hover:bg-grey-100'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                  </div>

                  {page < totalPages && (
                    <Link
                      href={`/blog?page=${page + 1}`}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-grey-300 text-grey-600 hover:border-red-primary hover:text-red-primary transition-colors"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
