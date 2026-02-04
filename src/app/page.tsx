import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { extractFirstImage } from '@/lib/seo';
import { isAllowedImageUrl } from '@/lib/images';
import AnimatedSection from './components/AnimatedSection';
import StatsCounter from './components/StatsCounter';
import TestimonialsSlider from './components/TestimonialsSlider';
import ParallaxHero from './components/ParallaxHero';

export const revalidate = 60;

// Sample featured projects data
const featuredProjects = [
  {
    id: 1,
    title: 'BMW M4 Competition',
    subtitle: 'Stage 2 ECU Remap + Downpipe',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80',
    beforeHP: 503,
    afterHP: 587,
    beforeTorque: 479,
    afterTorque: 553,
    category: 'German Performance',
  },
  {
    id: 2,
    title: 'Audi RS6 Avant',
    subtitle: 'Full Stage 3 Build',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80',
    beforeHP: 591,
    afterHP: 780,
    beforeTorque: 590,
    afterTorque: 738,
    category: 'German Performance',
  },
  {
    id: 3,
    title: 'Porsche 911 Turbo S',
    subtitle: 'ECU Tune + E85 Flex Fuel',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80',
    beforeHP: 640,
    afterHP: 750,
    beforeTorque: 590,
    afterTorque: 695,
    category: 'Supercar Tuning',
  },
  {
    id: 4,
    title: 'Mercedes-AMG GT63 S',
    subtitle: 'Stage 1+ Performance Package',
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80',
    beforeHP: 630,
    afterHP: 720,
    beforeTorque: 664,
    afterTorque: 780,
    category: 'German Performance',
  },
];

// Services data
const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'ECU Remapping',
    description: 'Custom calibrations tailored to your vehicle. We optimize fuel maps, ignition timing, and boost pressure for maximum performance gains while maintaining reliability.',
    features: ['Stage 1, 2 & 3 Tunes', 'Custom Mapping', 'Dyno Verified', 'OEM+ Quality'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Dyno Testing',
    description: 'State-of-the-art Dynapack hub dyno for precise power measurements. Get accurate baseline readings and verify your gains with professional dyno tuning sessions.',
    features: ['Dynapack Hub Dyno', 'Before/After Runs', 'Air/Fuel Analysis', 'Data Logging'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Performance Parts',
    description: 'Premium hardware upgrades including turbo systems, intercoolers, exhaust systems, and intake solutions. We source and install only the highest quality components.',
    features: ['Turbo Upgrades', 'Intercooler Kits', 'Exhaust Systems', 'Intake Solutions'],
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Gearbox Tuning',
    description: 'Optimize your transmission for faster shifts and improved response. DSG, PDK, and automatic transmission calibrations for a transformed driving experience.',
    features: ['DSG/DCT Tuning', 'Shift Speed Optimization', 'Launch Control', 'Sport+ Modes'],
  },
];

// Pricing packages
const packages = [
  {
    name: 'Stage 1',
    price: '899',
    description: 'Perfect for stock vehicles seeking reliable power gains',
    features: [
      'ECU remap for stock hardware',
      'Up to 30% power increase',
      'Improved throttle response',
      'Better fuel efficiency',
      'Dyno verification included',
      '30-day money-back guarantee',
    ],
    popular: false,
  },
  {
    name: 'Stage 2',
    price: '1,499',
    description: 'For vehicles with supporting bolt-on modifications',
    features: [
      'Everything in Stage 1',
      'Optimized for bolt-ons',
      'Up to 50% power increase',
      'Custom boost mapping',
      'E85 flex fuel option',
      'Extended 1-year tune warranty',
    ],
    popular: true,
  },
  {
    name: 'Stage 3',
    price: 'Custom',
    description: 'Full builds with major hardware modifications',
    features: [
      'Complete custom calibration',
      'Turbo/supercharger builds',
      'Engine internals support',
      'Race fuel optimization',
      'Dedicated tuning session',
      'Lifetime tune updates',
    ],
    popular: false,
  },
];

export default async function HomePage() {
  // Fetch recent published posts for blog preview
  // Handles database unavailability gracefully (common during builds)
  let recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail: string | null;
    createdAt: Date;
  }> = [];

  try {
    recentPosts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        thumbnail: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  } catch {
    // Database unavailable - continue with empty posts
    console.warn('Database unavailable - blog preview will be empty');
  }

  return (
    <>
      {/* Hero Section - Full Screen with Parallax */}
      <ParallaxHero />

      {/* Performance Stats Section - WHITE BACKGROUND */}
      <section className="py-24 md:py-32 section-light relative overflow-hidden">
        <div className="section-container relative z-10">
          <AnimatedSection className="text-center mb-20">
            <p className="section-label">
              Proven Results
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rich-black mb-8">
              Numbers That <span className="gradient-text-red">Speak</span>
            </h2>
            <p className="text-grey-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Over a decade of experience delivering measurable performance gains
            </p>
          </AnimatedSection>

          <StatsCounter variant="light" />
        </div>
      </section>

      {/* Services Section - DARK */}
      <section id="services" className="section-padding bg-rich-black">
        <div className="section-container">
          <AnimatedSection className="text-center mb-20">
            <p className="section-label">
              What We Do
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-pure-white mb-8">
              Performance <span className="gradient-text-red">Services</span>
            </h2>
            <p className="text-grey-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Comprehensive automotive performance solutions tailored to your specific goals
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <AnimatedSection
                key={service.title}
                delay={index * 100}
                className="card-premium p-8 md:p-10 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-red-primary/10 flex items-center justify-center text-red-primary mb-6 group-hover:bg-red-primary group-hover:text-pure-white transition-all duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-semibold text-pure-white mb-4">
                  {service.title}
                </h3>
                <p className="text-grey-400 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 text-sm bg-grey-800/50 text-grey-300 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section - WHITE */}
      <section id="projects" className="section-padding section-light">
        <div className="section-container">
          <AnimatedSection className="text-center mb-20">
            <p className="section-label">
              Our Work
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rich-black mb-8">
              Featured <span className="gradient-text-red">Builds</span>
            </h2>
            <p className="text-grey-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Real results from real customers. Every build is dyno-verified.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {featuredProjects.map((project, index) => (
              <AnimatedSection
                key={project.id}
                delay={index * 100}
                className="group"
              >
                <div className="card-premium-light overflow-hidden">
                  {/* Project Image */}
                  <div className="aspect-video bg-gradient-to-br from-grey-100 to-grey-200 relative overflow-hidden">
                    {isAllowedImageUrl(project.image) ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-rich-black/80 backdrop-blur-sm text-xs font-medium text-pure-white rounded-full uppercase tracking-wider">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-rich-black mb-1 group-hover:text-red-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-grey-500 text-sm mb-6">
                      {project.subtitle}
                    </p>

                    {/* Before/After Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-off-white rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-grey-500 text-sm font-medium uppercase tracking-wider">Horsepower</span>
                          <span className="text-red-primary text-sm font-semibold">
                            +{project.afterHP - project.beforeHP} HP
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-grey-400 text-lg">{project.beforeHP}</span>
                          <svg className="w-4 h-4 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="text-rich-black text-2xl font-bold">{project.afterHP}</span>
                        </div>
                      </div>
                      <div className="bg-off-white rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-grey-500 text-sm font-medium uppercase tracking-wider">Torque</span>
                          <span className="text-red-primary text-sm font-semibold">
                            +{project.afterTorque - project.beforeTorque} lb-ft
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-grey-400 text-lg">{project.beforeTorque}</span>
                          <svg className="w-4 h-4 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="text-rich-black text-2xl font-bold">{project.afterTorque}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-12">
            <Link href="/projects" className="btn-secondary-dark">
              View All Projects
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section - LIGHT GREY */}
      <section id="pricing" className="section-padding section-light-grey">
        <div className="section-container">
          <AnimatedSection className="text-center mb-20">
            <p className="section-label">
              Transparent Pricing
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rich-black mb-8">
              Performance <span className="gradient-text-red">Packages</span>
            </h2>
            <p className="text-grey-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Choose the right level of performance for your goals and hardware
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {packages.map((pkg, index) => (
              <AnimatedSection
                key={pkg.name}
                delay={index * 100}
                className={`relative ${pkg.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1.5 bg-red-primary text-pure-white text-sm font-semibold rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`card-premium-light p-8 h-full flex flex-col ${
                  pkg.popular ? 'border-red-primary' : ''
                }`}>
                  <h3 className="text-2xl font-semibold text-rich-black mb-2">
                    {pkg.name}
                  </h3>
                  <div className="mb-4">
                    {pkg.price === 'Custom' ? (
                      <span className="text-4xl font-bold text-rich-black">Custom</span>
                    ) : (
                      <>
                        <span className="text-grey-500">$</span>
                        <span className="text-4xl font-bold text-rich-black">{pkg.price}</span>
                      </>
                    )}
                  </div>
                  <p className="text-grey-600 mb-6">
                    {pkg.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-grey-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={pkg.popular ? 'btn-primary w-full justify-center' : 'btn-secondary-dark w-full justify-center'}
                  >
                    Get Started
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - DARK for contrast */}
      <section className="section-padding bg-rich-black overflow-hidden">
        <div className="section-container">
          <AnimatedSection className="text-center mb-20">
            <p className="section-label">
              Customer Reviews
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-pure-white mb-8">
              What Our <span className="gradient-text-red">Clients Say</span>
            </h2>
          </AnimatedSection>

          <TestimonialsSlider />
        </div>
      </section>

      {/* Blog Preview Section - WHITE */}
      <section className="section-padding section-light">
        <div className="section-container">
          <AnimatedSection className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div>
              <p className="section-label">
                Latest Articles
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-rich-black">
                From the <span className="gradient-text-red">Blog</span>
              </h2>
            </div>
            <Link href="/blog" className="text-grey-600 hover:text-red-primary font-medium inline-flex items-center gap-2 transition-colors">
              View All Posts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </AnimatedSection>

          {recentPosts.length === 0 ? (
            <AnimatedSection className="text-center py-16 bg-off-white rounded-3xl">
              <p className="text-grey-600 text-lg mb-4">No blog posts yet.</p>
              {/*<Link href="/admin/posts/new" className="btn-primary hidden">
                Create Your First Post 
              </Link>*/}
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post, index) => (
                <AnimatedSection key={post.id} delay={index * 100}>
                  <article className="card-premium-light group h-full flex flex-col">
                    {/* Post Image Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-grey-100 to-grey-200 relative overflow-hidden">
                      {(() => {
                        const imageUrl = post.thumbnail || extractFirstImage(post.content);
                        if (!imageUrl) {
                          return (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-12 h-12 text-grey-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                              </svg>
                            </div>
                          );
                        }

                        return isAllowedImageUrl(imageUrl) ? (
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        );
                      })()}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <time className="text-grey-500 text-sm mb-3">
                        {post.createdAt.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <h3 className="text-xl font-semibold text-rich-black mb-3 group-hover:text-red-primary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt && (
                        <p className="text-grey-600 line-clamp-2 flex-grow">
                          {post.excerpt}
                        </p>
                      )}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-red-primary font-medium mt-4 group/link"
                      >
                        Read More
                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - DARK dramatic */}
      <section className="py-32 md:py-40 bg-pure-black relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-primary/20 rounded-full blur-[180px]" />
        </div>

        <div className="section-container relative z-10">
          <AnimatedSection className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-10 leading-[1.1]">
              Ready to Unlock Your
              <br />
              <span className="gradient-text-red">Vehicle&apos;s Potential?</span>
            </h2>
            <p className="text-grey-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Book a consultation with our performance specialists and discover
              what&apos;s possible for your vehicle.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/contact" className="btn-primary text-base">
                Book Consultation
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a href="tel:+13105551234" className="btn-secondary text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (310) 555-1234
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
