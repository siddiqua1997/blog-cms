import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { generateBreadcrumbJsonLd } from '@/lib/seo';
import { isAllowedImageUrl } from '@/lib/images';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toxictuning.com';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore recent performance builds, dyno results, and transformations from Toxic Tuning.',
  alternates: {
    canonical: `${baseUrl}/projects`,
  },
  openGraph: {
    title: 'Projects | Toxic Tuning',
    description: 'Explore recent performance builds, dyno results, and transformations from Toxic Tuning.',
    url: `${baseUrl}/projects`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects | Toxic Tuning',
    description: 'Explore recent performance builds, dyno results, and transformations from Toxic Tuning.',
  },
};

const projects = [
  {
    title: 'BMW M4 Competition',
    subtitle: 'Stage 2 ECU Remap + Downpipe',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80',
    stats: ['503 → 587 HP', '479 → 553 lb-ft', '0–60: 3.6s'],
  },
  {
    title: 'Audi RS6 Avant',
    subtitle: 'Full Stage 3 Build',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80',
    stats: ['591 → 780 HP', '590 → 738 lb-ft', '0–60: 3.1s'],
  },
  {
    title: 'Porsche 911 Turbo S',
    subtitle: 'ECU Tune + E85 Flex Fuel',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    stats: ['640 → 750 HP', '590 → 695 lb-ft', '0–60: 2.5s'],
  },
  {
    title: 'Mercedes-AMG GT63 S',
    subtitle: 'Stage 1+ Performance Package',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80',
    stats: ['630 → 720 HP', '664 → 780 lb-ft', '0–60: 3.0s'],
  },
];

export default function ProjectsPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: baseUrl },
    { name: 'Projects', url: `${baseUrl}/projects` },
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
              right: '-10%',
              filter: 'blur(90px)',
            }}
          />
        </div>
        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Recent Work
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            Projects
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            From OEM+ builds to full Stage 3 transformations, these are the
            results our clients drive home.
          </p>
        </div>
      </section>

      <section className="section-padding section-light">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <article key={project.title} className="card-premium-light overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-grey-100 to-grey-200 relative overflow-hidden">
                  {isAllowedImageUrl(project.image) ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-rich-black mb-2">
                    {project.title}
                  </h2>
                  <p className="text-grey-600 mb-4">{project.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.stats.map((stat) => (
                      <span
                        key={stat}
                        className="px-3 py-1 text-sm bg-grey-100 text-grey-700 rounded-full"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/contact" className="btn-primary">
              Start Your Build
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
