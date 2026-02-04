import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Sign in to Toxic Tuning admin portal',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout excludes the main header and footer
  // by simply rendering children without wrapping in the root layout's structure
  return <>{children}</>;
}
