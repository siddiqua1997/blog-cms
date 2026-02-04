/**
 * Admin Layout
 *
 * Simple wrapper for admin pages.
 * Header/Footer hide themselves when on /admin routes.
 */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
