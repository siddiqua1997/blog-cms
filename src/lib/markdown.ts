import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

/**
 * Markdown processing utilities for blog content
 *
 * Design decisions:
 * - Uses remark for parsing (fast, extensible)
 * - Supports standard Markdown with images
 * - Images are embedded via standard Markdown syntax: ![alt](url)
 * - Sanitizes output HTML for security
 */

/**
 * Converts Markdown content to HTML
 * Images embedded as ![alt](url) will render in their exact position
 *
 * @example
 * const html = await markdownToHtml("# Hello\n\n![image](https://example.com/img.jpg)")
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      code: ['className'],
      pre: ['className'],
    },
  };

  const result = await remark()
    .use(remarkRehype)
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

/**
 * Extracts all image URLs from Markdown content
 * Useful for:
 * - Validating images exist before publishing
 * - Generating image previews
 * - Cleanup when posts are deleted
 *
 * @example
 * extractImageUrls("![alt](https://example.com/a.jpg) text ![](https://example.com/b.jpg)")
 * // Returns: ["https://example.com/a.jpg", "https://example.com/b.jpg"]
 */
export function extractImageUrls(markdown: string): string[] {
  // Matches Markdown image syntax: ![alt text](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[2]);
  }

  return urls;
}

/**
 * Generates a plain text excerpt from Markdown
 * Strips all Markdown formatting for use in meta descriptions and previews
 *
 * @param markdown - The Markdown content
 * @param maxLength - Maximum length of excerpt (default: 160 for SEO)
 */
export function generateExcerpt(markdown: string, maxLength: number = 160): string {
  // Remove images
  let text = markdown.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Truncate with ellipsis
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3).trim() + '...';
  }

  return text;
}

/**
 * Validates Markdown content
 * Returns an array of issues found (empty array = valid)
 */
export function validateMarkdown(markdown: string): string[] {
  const issues: string[] = [];

  // Check for empty content
  if (!markdown || markdown.trim().length === 0) {
    issues.push('Content cannot be empty');
  }

  // Check for broken image links (basic validation)
  const imageUrls = extractImageUrls(markdown);
  for (const url of imageUrls) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      issues.push(`Invalid image URL: ${url}`);
    }
  }

  return issues;
}

export default { markdownToHtml, extractImageUrls, generateExcerpt, validateMarkdown };
