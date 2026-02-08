import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import NavigationGuard from './components/NavigationGuard';
import Footer from './components/Footer';
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from '@/lib/seo';

/**
 * Root Layout - Toxic Tuning Premium Design
 *
 * Apple-level sophistication with:
 * - Dark theme default
 * - Premium typography
 * - Smooth page transitions
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com'),
  title: {
    default: 'Toxic Tuning | Premium Automotive Performance Engineering',
    template: '%s | Toxic Tuning',
  },
  description: 'Unleash your vehicle\'s true potential with precision ECU remapping, dyno testing, and performance upgrades. Premium automotive tuning services.',
  keywords: ['car tuning', 'ECU remapping', 'performance tuning', 'dyno testing', 'automotive performance', 'engine tuning', 'turbo tuning'],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Toxic Tuning | Premium Automotive Performance Engineering',
    description: 'Unleash your vehicle\'s true potential with precision ECU remapping and dyno-proven results.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'Toxic Tuning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toxic Tuning | Premium Automotive Performance Engineering',
    description: 'Unleash your vehicle\'s true potential with precision ECU remapping and dyno-proven results.',
    images: ['/og-default.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Organization & Website JSON-LD for brand authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateOrganizationJsonLd() }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: generateWebsiteJsonLd() }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-pure-black text-pure-white antialiased">
        {/* Fixed Header with Glassmorphism */}
        <Header />
        <NavigationGuard />

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
