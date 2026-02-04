export function isAllowedImageUrl(src: string | null): boolean {
  if (!src) return false;

  // Local images are always allowed
  if (src.startsWith('/')) return true;

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();

    if (host === 'res.cloudinary.com') return true;
    if (host === 'images.unsplash.com') return true;
    if (host === 'amazonaws.com' || host.endsWith('.amazonaws.com')) return true;

    return false;
  } catch {
    return false;
  }
}
