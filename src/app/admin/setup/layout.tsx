import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Setup',
  description: 'Set up your Toxic Tuning admin account',
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
