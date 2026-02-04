'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * ParallaxHero Component
 *
 * Cinematic full-screen hero with:
 * - Dramatic background image with parallax
 * - Dark overlay for text contrast
 * - Large, luxury typography
 * - Elegant fade-in animations
 * - Premium feel throughout
 */
export default function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
        }}
      >
        {/* Hero Background Image - High performance car */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2574&q=80')`,
            backgroundColor: '#0a0a0a',
          }}
        />
      </div>

      {/* Dark Cinematic Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-pure-black/70 via-pure-black/50 to-pure-black/90" />

      {/* Additional vignette effect */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0) 100%)',
        }}
      />

      {/* Animated accent glow */}
      <div
        className="absolute z-[2] w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(255, 10, 10, 0.6) 0%, transparent 70%)',
          top: '30%',
          right: '10%',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pure-black via-pure-black/80 to-transparent z-[3]" />

      {/* Main Content */}
      <div className="section-container relative z-10 pt-32 pb-40">
        <div className="max-w-6xl mx-auto text-center">

          {/* Elegant Eyebrow Text */}
          <div
            className={`overflow-hidden mb-8 transition-all duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <p
              className={`text-red-primary font-light tracking-[0.4em] uppercase text-sm md:text-sm transform transition-transform duration-1000 ${
                isLoaded ? 'translate-y-0' : 'translate-y-full'
              }`}
              style={{
                fontFamily: 'var(--font-heading-alt)',
                transitionDelay: '300ms'
              }}
            >
              Premium Automotive Performance
            </p>
          </div>

          {/* Main Headline - Large & Dramatic */}
          <div className="overflow-hidden">
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-bold text-pure-white leading-[0.9] tracking-wide transform transition-all duration-1200 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{
                fontFamily: 'var(--font-display)',
                transitionDelay: '500ms',
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}
            >
              Unleash
            </h1>
          </div>

          <div className="overflow-hidden mb-8">
            <h1
              className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-bold leading-[0.9] tracking-wide transform transition-all duration-1200 ${
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
              style={{
                fontFamily: 'var(--font-display)',
                transitionDelay: '700ms',
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-primary via-red-400 to-red-primary">
                Performance
              </span>
            </h1>
          </div>

          {/* Elegant Subheadline */}
          <div
            className={`max-w-2xl mx-auto mb-14 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <p
              className="text-lg md:text-xl lg:text-2xl text-grey-200 leading-relaxed font-light"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Precision ECU remapping and dyno-proven engineering
              <span className="hidden sm:inline"><br /></span>
              {' '}for those who demand excellence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-5 justify-center items-center transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '1100ms' }}
          >
            {/* Primary CTA - Prominent Red Button */}
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-red-primary text-pure-white text-lg font-semibold tracking-wide rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,10,10,0.5)]"
              style={{ fontFamily: 'var(--font-heading-alt)' }}
            >
              <span className="relative z-10">Book Your Tune</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              {/* Hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/#projects"
              className="group inline-flex items-center gap-3 px-10 py-5 border-2 border-pure-white/30 text-pure-white text-lg font-medium tracking-wide rounded-full transition-all duration-500 hover:border-pure-white hover:bg-pure-white/10"
              style={{ fontFamily: 'var(--font-heading-alt)' }}
            >
              <span>View Our Work</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div
            className={`mt-20 flex flex-wrap justify-center items-center gap-x-10 gap-y-4 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '1300ms' }}
          >
            {[
              { icon: '✓', text: 'Dyno Verified' },
              { icon: '✓', text: 'OEM+ Quality' },
              { icon: '✓', text: 'Lifetime Support' },
              { icon: '✓', text: '2,500+ Vehicles' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-grey-400"
              >
                <span className="text-red-primary text-sm">{item.icon}</span>
                <span
                  className="text-sm tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-heading-alt)', fontWeight: 500 }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-20 transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '1500ms' }}
      >
        <Link
          href="/#services"
          className="flex flex-col items-center gap-3 text-grey-400 hover:text-pure-white transition-colors duration-300 group"
        >
          <span
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-heading-alt)' }}
          >
            Discover More
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-grey-400 to-transparent group-hover:from-red-primary transition-colors duration-300" />
        </Link>
      </div>
    </section>
  );
}
