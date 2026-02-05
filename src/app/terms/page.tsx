import Link from 'next/link';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Review the terms that govern use of our site and services.',
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Toxic Tuning',
    description: 'Review the terms that govern use of our site and services.',
    url: `${baseUrl}/terms`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Toxic Tuning',
    description: 'Review the terms that govern use of our site and services.',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-pure-black text-pure-white">
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-pure-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute w-[700px] h-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.35) 0%, transparent 70%)',
              top: '-20%',
              right: '-10%',
              filter: 'blur(90px)',
            }}
          />
        </div>
        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Legal
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            Terms of Service
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            Please review the terms that govern use of our site and services.
          </p>
        </div>
      </section>

      <section className="section-padding section-light">
        <div className="section-container">
          <div className="max-w-3xl mx-auto card-premium-light p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-rich-black mb-4">General</h2>
            <p className="text-grey-600 mb-6">
              By accessing our website or booking services, you agree to these
              terms. We may update them periodically.
            </p>
            <h3 className="text-xl font-semibold text-rich-black mb-3">Services</h3>
            <ul className="list-disc pl-6 text-grey-600 space-y-2 mb-6">
              <li>Services are provided subject to vehicle condition and suitability.</li>
              <li>Quotes are estimates and may change based on inspection.</li>
              <li>Appointments are subject to availability.</li>
            </ul>
            <h3 className="text-xl font-semibold text-rich-black mb-3">Liability</h3>
            <p className="text-grey-600 mb-6">
              We are not responsible for issues resulting from misuse or
              undisclosed vehicle modifications. Always follow recommended
              maintenance and usage guidelines.
            </p>
            <p className="text-grey-600 mb-8">
              If you have questions, contact us before booking.
            </p>
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
