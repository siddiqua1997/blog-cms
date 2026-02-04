import type { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt for SEO
 *
 * Allows all bots to crawl the site and references the sitemap.
 * Blocks admin pages and API routes from indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
