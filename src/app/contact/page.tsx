import type { Metadata } from 'next';
import ContactClient from './ContactClient';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Toxic Tuning for performance tuning, dyno testing, and custom builds.',
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: 'Contact | Toxic Tuning',
    description: 'Get in touch with Toxic Tuning for performance tuning, dyno testing, and custom builds.',
    url: `${baseUrl}/contact`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | Toxic Tuning',
    description: 'Get in touch with Toxic Tuning for performance tuning, dyno testing, and custom builds.',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
