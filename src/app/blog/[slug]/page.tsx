import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { markdownToHtml } from '@/lib/markdown';
import { unstable_cache } from 'next/cache';
import { generatePostMetadata, generateArticleJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import CommentForm from './CommentForm';
import RelatedPosts from './RelatedPosts';
import CommentsSection from './CommentsSection';

/**
 * Single Post Page
 *
 * Premium dark theme blog post with:
 * - Server component for direct DB access (no API calls)
 * - Enhanced SEO with OpenGraph and Twitter Cards
 * - JSON-LD structured data for rich search results
 * - ISR (Incremental Static Regeneration) for performance
 */

type PageProps = {
  params: Promise<{ slug: string }>;
};

// ISR: Revalidate every 600 seconds for fresh content
export const revalidate = 600;

// Generate static params - return empty to use on-demand generation
// With force-dynamic, pages are rendered at request time anyway
export async function generateStaticParams() {
  return [];
}

// Generate SEO metadata with smart fallbacks
const getPostMeta = async (slug: string) =>
  unstable_cache(
    async () =>
      prisma.post.findUnique({
        where: { slug },
        select: {
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          thumbnail: true,
          seoTitle: true,
          seoDesc: true,
          seoImage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ['post-meta', slug],
    { revalidate: 600 }
  )();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    const post = await getPostMeta(slug);

    if (!post) {
      return { title: 'Post Not Found' };
    }

    // Use the SEO utility for metadata generation with fallbacks
    return generatePostMetadata({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      thumbnail: post.thumbnail,
      seoTitle: post.seoTitle,
      seoDesc: post.seoDesc,
      seoImage: post.seoImage,
      publishedAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
      updatedAt: post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
    });
  } catch {
    return { title: 'Blog Post | Toxic Tuning' };
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  // Server component: Direct DB access, no API fetch needed
  let post: Awaited<ReturnType<typeof prisma.post.findUnique>> | null = null;

  try {
    post = await unstable_cache(
      async () =>
        prisma.post.findUnique({
          where: { slug },
        }),
      ['post', slug],
      { revalidate: 600 }
    )();

    if (post) {
      post.createdAt = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt);
      post.updatedAt = post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt);
    }
  } catch (error) {
    console.warn('Database unavailable - blog post cannot be loaded', error);
    return notFound();
  }

  if (!post || !post.published) {
    notFound();
  }

  let contentHtml = '';
  try {
    contentHtml = await markdownToHtml(post.content);
  } catch (error) {
    console.warn('Markdown render failed', error);
    contentHtml = '';
  }

  // Generate JSON-LD structured data (Article schema for better SEO)
  const postJsonLd = generateArticleJsonLd({
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    thumbnail: post.thumbnail,
    seoTitle: post.seoTitle,
    seoDesc: post.seoDesc,
    seoImage: post.seoImage,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: process.env.NEXT_PUBLIC_APP_URL || '' },
    { name: 'Blog', url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/blog` },
    { name: post.title, url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${post.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: postJsonLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />

      {/* Post Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-pure-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute w-[700px] h-[700px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.4) 0%, transparent 70%)',
              top: '-20%',
              right: '-10%',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-red-primary hover:text-red-hover transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pure-white leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-grey-300">
              <time dateTime={post.createdAt.toISOString()}>
                {post.createdAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.updatedAt > post.createdAt && (
                <>
                  <span className="w-1 h-1 rounded-full bg-grey-600" />
                  <span>
                    Updated {post.updatedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <article className="section-padding bg-pure-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            {/* Markdown Content */}
            <div
              className="prose-toxic-light"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Share / Actions */}
            <div className="border-t border-grey-200 mt-16 pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-grey-600">
                  Enjoyed this article? Share it with your friends!
                </p>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center text-grey-600 hover:bg-red-primary hover:text-pure-white transition-colors"
                    aria-label="Share on X"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center text-grey-600 hover:bg-red-primary hover:text-pure-white transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL || ''}/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center text-grey-600 hover:bg-red-primary hover:text-pure-white transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="section-padding bg-off-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <CommentsSection postId={post.id} />

            {/* Comment Form */}
            <div className="rounded-2xl p-6 md:p-8 bg-pure-white border border-grey-200 shadow-sm">
              <h3 className="text-xl font-semibold text-rich-black mb-6">
                Leave a Comment
              </h3>
              <CommentForm postId={post.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts for Internal Linking */}
      <RelatedPosts currentSlug={post.slug} />
    </>
  );
}
