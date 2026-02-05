import Link from 'next/link';
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read how Toxic Tuning collects, uses, and protects your information.',
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: 'Privacy Policy | Toxic Tuning',
    description: 'Read how Toxic Tuning collects, uses, and protects your information.',
    url: `${baseUrl}/privacy`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Toxic Tuning',
    description: 'Read how Toxic Tuning collects, uses, and protects your information.',
  },
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            We respect your privacy and are committed to protecting your data.
          </p>
        </div>
      </section>

      <section className="section-padding section-light">
        <div className="section-container">
          <div className="max-w-3xl mx-auto card-premium-light p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-rich-black mb-4">Overview</h2>
            <p className="text-grey-600 mb-6">
              This policy explains what information we collect, why we collect it,
              and how it is used. We only collect data necessary to provide our
              services and improve your experience.
            </p>
            <h3 className="text-xl font-semibold text-rich-black mb-3">Information We Collect</h3>
            <ul className="list-disc pl-6 text-grey-600 space-y-2 mb-6">
              <li>Contact details you submit (name, email, phone).</li>
              <li>Vehicle and service details you share with us.</li>
              <li>Basic analytics for site performance and security.</li>
            </ul>
            <h3 className="text-xl font-semibold text-rich-black mb-3">How We Use It</h3>
            <ul className="list-disc pl-6 text-grey-600 space-y-2 mb-6">
              <li>To respond to inquiries and schedule services.</li>
              <li>To improve site performance and user experience.</li>
              <li>To maintain security and prevent abuse.</li>
            </ul>
            <p className="text-grey-600 mb-8">
              For any questions, contact us and we’ll be happy to help.
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
