import Link from 'next/link';
import type { Metadata } from 'next';
import { generateBreadcrumbJsonLd } from '@/lib/seo';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Toxic Tuning, our process, and our commitment to reliable performance gains.',
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'About | Toxic Tuning',
    description: 'Learn about Toxic Tuning, our process, and our commitment to reliable performance gains.',
    url: `${baseUrl}/about`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Toxic Tuning',
    description: 'Learn about Toxic Tuning, our process, and our commitment to reliable performance gains.',
  },
};

const highlights = [
  {
    title: 'Dyno-Verified Results',
    description:
      'Every calibration is validated on our dyno with before/after data you can trust.',
  },
  {
    title: 'OEM+ Reliability',
    description:
      'Performance gains without sacrificing drivability, longevity, or safety systems.',
  },
  {
    title: 'Specialist Team',
    description:
      'Tuners, engineers, and technicians who live and breathe high-performance builds.',
  },
];

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: baseUrl },
    { name: 'About', url: `${baseUrl}/about` },
  ]);

  return (
    <div className="bg-pure-black text-pure-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
      />
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-pure-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute w-[700px] h-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.35) 0%, transparent 70%)',
              top: '-20%',
              left: '-10%',
              filter: 'blur(90px)',
            }}
          />
        </div>
        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Our Story
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            About Toxic Tuning
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            We help drivers unlock performance the right way — with precision
            tuning, dyno data, and a relentless focus on reliability.
          </p>
        </div>
      </section>

      <section className="section-padding section-light">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-rich-black mb-6">
                Built on real-world results
              </h2>
              <p className="text-grey-700 mb-6 leading-relaxed">
                From daily drivers to full builds, we treat every vehicle like it
                matters — because it does. Our process blends modern ECU
                calibration techniques with proven mechanical upgrades for clean,
                repeatable gains.
              </p>
              <p className="text-grey-700 mb-6 leading-relaxed">
                We believe in transparent tuning: clear data, clear targets, and
                results you can feel. No shortcuts, no questionable maps, just
                real performance done the right way.
              </p>
              <Link href="/contact" className="btn-primary">
                Talk to a Specialist
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-grey-200 shadow-sm p-8">
              <h3 className="text-xl font-semibold text-rich-black mb-6">
                What sets us apart
              </h3>
              <div className="space-y-6">
                {highlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-rich-black mb-1">
                        {item.title}
                      </h4>
                      <p className="text-grey-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
