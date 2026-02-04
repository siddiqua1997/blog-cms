/**
 * Converts a string into a URL-friendly slug
 * Used for generating post URLs from titles
 *
 * Features:
 * - Converts to lowercase
 * - Replaces spaces and special chars with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 * - Handles unicode characters (basic transliteration)
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("My Blog Post #1") // "my-blog-post-1"
 * slugify("Café & Restaurant") // "cafe-restaurant"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word chars except hyphens
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end
}

/**
 * Generates a unique slug by appending a number if the base slug already exists
 * Use this with a database check to ensure uniqueness
 *
 * @example
 * // If "hello-world" exists, returns "hello-world-2"
 * await generateUniqueSlug("Hello World", checkSlugExists)
 */
export async function generateUniqueSlug(
  title: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 2;

  // Keep incrementing until we find a unique slug
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export default slugify;
