import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { isAllowedImageUrl } from '@/lib/images';

/**
 * Related Posts Component for Internal Linking
 *
 * Displays the latest 3 published posts (excluding current post).
 * Server component for direct DB access and SEO benefits.
 */

interface RelatedPostsProps {
  currentSlug: string;
}

export default async function RelatedPosts({ currentSlug }: RelatedPostsProps) {
  let posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail: string | null;
    createdAt: Date;
  }> = [];

  try {
    posts = await unstable_cache(
      async () =>
        prisma.post.findMany({
          where: {
            published: true,
            slug: { not: currentSlug },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            thumbnail: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      ['related-posts', currentSlug],
      { revalidate: 600 }
    )();

    posts = posts.map((post) => ({
      ...post,
      createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
    }));
  } catch {
    return null;
  }

  if (posts.length === 0) {
    return null;
  }

  const getPostImage = (post: { thumbnail: string | null }) => post.thumbnail;

  return (
    <section className="section-padding bg-pure-white border-t border-grey-200">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-red-primary font-light tracking-[0.2em] uppercase text-xs mb-4">
              Keep Reading
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-rich-black">
              Related <span className="text-red-primary">Articles</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => {
              const postImage = getPostImage(post);

              return (
                <article
                  key={post.id}
                  className="card-premium-light rounded-2xl overflow-hidden group"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="aspect-video bg-grey-100 relative overflow-hidden">
                      {postImage ? (
                        isAllowedImageUrl(postImage) ? (
                          <Image
                            src={postImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
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
                          <svg className="w-12 h-12 text-grey-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-red-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </Link>

                  <div className="p-5">
                    <time
                      dateTime={post.createdAt.toISOString()}
                      className="text-xs text-grey-500 mb-2 block"
                    >
                      {post.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>

                    <h3 className="text-lg font-semibold text-rich-black mb-2 group-hover:text-red-primary transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    {post.excerpt && (
                      <p className="text-sm text-grey-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-red-primary font-medium hover:text-red-400 transition-colors"
            >
              View All Articles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
