import type { Metadata } from 'next';

/**
 * SEO Metadata Generation
 *
 * Generates Next.js metadata for blog posts with smart fallbacks.
 * Handles OpenGraph and Twitter Card meta tags for social sharing.
 *
 * Fallback Strategy:
 * - seoTitle → post title
 * - seoDesc → post excerpt → first 160 chars of content
 * - seoImage → thumbnail → first image from content
 */

// Site-wide configuration
const SITE_CONFIG = {
  name: 'Toxic Tuning',
  tagline: 'Performance Tuning Excellence',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com',
  defaultImage: '/og-default.jpg', // Place a default OG image in /public
  twitterHandle: '@tuningtoxic', // Update with your Twitter handle
  locale: 'en_US',
};

/**
 * Post data for SEO generation
 */
export interface PostSEOData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  seoTitle?: string | null;
  seoDesc?: string | null;
  seoImage?: string | null;
  publishedAt?: Date;
  updatedAt?: Date;
}

/**
 * Extract first image URL from markdown content
 *
 * @param content - Markdown content
 * @returns First image URL or null
 */
export function extractFirstImage(content: string): string | null {
  // Match markdown image syntax: ![alt](url)
  const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^)]+)\)/);
  if (imageMatch) {
    return imageMatch[1];
  }

  // Match HTML img tags: <img src="url">
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch) {
    return htmlMatch[1];
  }

  return null;
}

/**
 * Generate excerpt from content if not provided
 *
 * @param content - Markdown content
 * @param maxLength - Maximum length (default: 160)
 * @returns Clean excerpt text
 */
export function generateExcerptFromContent(
  content: string,
  maxLength: number = 160
): string {
  // Remove markdown formatting
  let text = content
    // Remove images
    .replace(/!\[.*?\]\([^)]+\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Remove bold/italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove blockquotes
    .replace(/^>\s*/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Truncate to maxLength, trying to break at a word boundary
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    const lastSpace = text.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.7) {
      text = text.substring(0, lastSpace);
    }
    text += '...';
  }

  return text;
}

/**
 * Get effective SEO values with fallbacks
 */
function getEffectiveSEO(post: PostSEOData) {
  const title = post.seoTitle || post.title;
  const description =
    post.seoDesc ||
    post.excerpt ||
    generateExcerptFromContent(post.content);
  const image =
    post.seoImage ||
    post.thumbnail ||
    extractFirstImage(post.content) ||
    `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`;

  return { title, description, image };
}

/**
 * Generate full metadata for a blog post
 *
 * Usage in page.tsx:
 * ```tsx
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const post = await getPost(params.slug);
 *   return generatePostMetadata(post);
 * }
 * ```
 */
export function generatePostMetadata(post: PostSEOData): Metadata {
  const { title, description, image } = getEffectiveSEO(post);
  const url = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    // Basic meta
    title: `${title} | ${SITE_CONFIG.name}`,
    description,

    // Canonical URL
    alternates: {
      canonical: url,
    },

    // OpenGraph for Facebook, LinkedIn, etc.
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE_CONFIG.locale,
      ...(post.publishedAt && {
        publishedTime: post.publishedAt.toISOString(),
      }),
      ...(post.updatedAt && {
        modifiedTime: post.updatedAt.toISOString(),
      }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
    },

    // Additional meta
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for the blog listing page
 */
export function generateBlogListMetadata(): Metadata {
  return {
    title: `Blog | ${SITE_CONFIG.name}`,
    description: `Latest articles, tutorials, and insights about performance tuning from ${SITE_CONFIG.name}.`,
    openGraph: {
      type: 'website',
      title: `Blog | ${SITE_CONFIG.name}`,
      description: `Latest articles, tutorials, and insights about performance tuning.`,
      url: `${SITE_CONFIG.url}/blog`,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: 'summary',
      title: `Blog | ${SITE_CONFIG.name}`,
      description: `Latest articles, tutorials, and insights about performance tuning.`,
    },
  };
}

/**
 * Generate JSON-LD structured data for a blog post
 *
 * Add this to your post page for enhanced search results:
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: generatePostJsonLd(post) }}
 * />
 * ```
 */
export function generatePostJsonLd(post: PostSEOData): string {
  const { title, description, image } = getEffectiveSEO(post);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image,
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate breadcrumb JSON-LD
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate Organization JSON-LD for site-wide structured data
 * Add this to your root layout for brand authority signals
 */
export function generateOrganizationJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: 'Premium automotive performance tuning, ECU remapping, and dyno testing services.',
    sameAs: [
      'https://x.com/tuningtoxic',
      'https://www.facebook.com/toxictuning',
      'https://www.instagram.com/toxictuning',
      'https://www.youtube.com/toxic-tuning',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_CONFIG.url}/contact`,
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate WebSite JSON-LD with search action
 * Helps Google understand your site structure
 */
export function generateWebsiteJsonLd(): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: 'Premium automotive performance tuning, ECU remapping, and dyno testing services.',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
    },
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate Article JSON-LD (enhanced version of BlogPosting)
 * Use this for more comprehensive article structured data
 */
export function generateArticleJsonLd(post: PostSEOData & { wordCount?: number }): string {
  const { title, description, image } = getEffectiveSEO(post);
  const wordCount = post.wordCount || post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    },
    url: `${SITE_CONFIG.url}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.publishedAt?.toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
    wordCount,
    timeRequired: `PT${readingTime}M`,
    inLanguage: SITE_CONFIG.locale,
    isAccessibleForFree: true,
  };

  return JSON.stringify(jsonLd);
}

/**
 * Export site config for use in other modules
 */
export { SITE_CONFIG };
