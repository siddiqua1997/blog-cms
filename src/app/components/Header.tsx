'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

/**
 * Premium Header Component
 *
 * Features the official Toxic Tuning logo and branding.
 * Uses cohesive Oswald + Roboto font pairing.
 */

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide header on admin pages (they have their own navigation)
  const isAdminPage = pathname?.startsWith('/admin');

  // Glassmorphism effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Don't render on admin pages
  if (isAdminPage) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'py-3 bg-pure-black/80 backdrop-blur-xl border-b border-white/5'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between">
          {/* Toxic Tuning Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            {/* Official Toxic Tuning Logo SVG */}
            <div className="flex items-center">
              <svg
                viewBox="0 0 31797 4633"
                role="img"
                xmlSpace="preserve"
                className="h-6 w-autoh-7 w-auto lg:h-9"
                style={{
                  shapeRendering: "geometricPrecision",
                  textRendering: "geometricPrecision",
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                }}
              >
                <defs>
                  <style>
                    {`
                      .fil0 { fill:#ED3237 }
                      .fil1 { fill:#FEFEFE; fill-rule:nonzero }
                    `}
                  </style>
                </defs>

                <g id="Layer_x0020_1">
                  <metadata id="CorelCorpID_0Corel-Layer"></metadata>
                  <g id="_263587024">
                  <polygon className="fil0" points="0,0 31797,0 31797,4633 0,4633 "></polygon>
                  <g id="_1232563089536">
                    <path className="fil1" d="M13748 1679l0 -7c0,-368 -299,-663 -667,-663l-1325 0c-375,0 -674,299 -674,670l393 0c0,-153 120,-277 281,-277l1325 0c154,0 278,124 278,277l389 0zm-667 1996c364,0 667,-292 667,-659l0 -7 -389 0c0,153 -124,277 -278,277l-1329 0c-153,0 -277,-127 -277,-282l0 -841 -393 0 0 841c0,372 299,671 670,671l1329 0zm-2374 0l-393 0 0 -2666 393 0 0 2666zm-741 0l-1075 -1326 1086 -1340 -506 0 -831 1029 -640 -785c-120,-146 -308,-244 -514,-244l-2351 0c-371,0 -671,299 -671,670l0 1325c0,372 300,671 671,671l1351 0c364,-15 648,-314 648,-671l0 -1167 -393 0 0 1167c0,147 -119,271 -265,278l-1341 0c-154,0 -277,-123 -277,-278l0 -1325c0,-153 123,-277 277,-277l2370 0c71,4 131,34 176,83l704 864 -1075 1326 502 0 828 -1014 824 1014 502 0zm-6977 0l-394 0 0 -2273 -1138 0 0 -393 1532 0 0 2666zm1139 -2273l-746 0 0 -393 746 0 0 393z"></path>
                    <g>
                    <path className="fil1" d="M29545 3675l0 -389 -1214 0c-154,0 -277,-127 -277,-282l0 -1321c0,-157 123,-281 280,-281l1327 0c153,0 276,120 276,277l391 0 0 -7c0,-368 -301,-663 -667,-663l-1327 0c-370,0 -674,299 -674,670l0 1325c0,372 301,671 671,671l1214 0z"></path>
                    <polygon className="fil1" points="30331,3675 30331,2163 28998,2163 28998,2555 29937,2555 29937,3675 "></polygon>
                    <polygon className="fil1" points="27287,3675 27287,1009 26893,1009 26893,3069 25009,1009 24616,1009 24616,1402 24841,1402 26919,3675 "></polygon>
                    <polygon className="fil1" points="25009,3675 25009,2163 24616,2163 24616,3675 "></polygon>
                    <polygon className="fil1" points="24242,3675 23848,3675 23848,1009 24242,1009 "></polygon>
                    <polygon className="fil1" points="23473,3675 23473,1009 23081,1009 23081,3069 21197,1009 20804,1009 20804,1402 21029,1402 23107,3675 "></polygon>
                    <polygon className="fil1" points="21197,3675 21197,2163 20804,2163 20804,3675 "></polygon>
                    <path className="fil1" d="M19759 3675c370,0 670,-299 670,-671l0 -1995 -393 0 0 1995c0,155 -123,282 -277,282l-417 0 -51 0 -394 0 -52 0 -430 0c-146,-11 -262,-135 -262,-282l0 -1995 -394 0 0 1995c0,357 285,656 648,671l438 0 52 0 394 0 51 0 417 0z"></path>
                    <polygon className="fil1" points="16247,3675 15853,3675 15853,1402 14714,1402 14714,1009 16247,1009 "></polygon>
                    <polygon className="fil1" points="17384,1402 16639,1402 16639,1009 17384,1009 "></polygon>
                    <path className="fil1" d="M13528 2359c-1,-7 -1,-4 0,0z"></path>
                    <path className="fil1" d="M12236 2014l0 -1c5,-6 2,-3 0,1z"></path>
                    <path className="fil1" d="M12526 3127c-4,-1 -11,-5 0,0z"></path>
                    <path className="fil1" d="M12710 3177c-4,-1 -8,-1 0,0z"></path>
                    <path className="fil1" d="M12907 3177c9,-1 5,-1 0,0z"></path>
                    </g>
                  </g>
                  </g>
                </g>
              </svg>

            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
            {/*<Link
              href="/admin"
              className="btn-primary !py-2.5 !px-5 text-sm"
            >
              Admin Portal
            </Link>*/}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300 ${
              isMobileMenuOpen ? 'bg-grey-800' : 'hover:bg-grey-800/50'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className={`flex flex-col gap-1.5 ${isMobileMenuOpen ? 'hamburger-open' : ''}`}>
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-0 bg-pure-black/95 backdrop-blur-2xl z-40 transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full flex flex-col pt-24 px-6">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-3xl font-semibold text-pure-white py-4 border-b border-grey-800/50 transition-all duration-500 hover:text-[#ED3237] hover:pl-4 uppercase tracking-wide ${
                  isMobileMenuOpen
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-8'
                }`}
                style={{
                  transitionDelay: `${index * 75}ms`,
                  fontFamily: "'Oswald', sans-serif"
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pb-12">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`btn-primary w-full justify-center transition-all duration-500 ${
                isMobileMenuOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              Admin Portal
            </Link>

            {/* Social Links */}
            <div className={`flex justify-center gap-6 mt-8 transition-all duration-500 ${
              isMobileMenuOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms' }}
            >
              {[
                { name: 'Facebook', href: 'https://www.facebook.com/toxictuning' },
                { name: 'Instagram', href: 'https://www.instagram.com/toxictuning' },
                { name: 'YouTube', href: 'https://www.youtube.com/toxic-tuning' },
                { name: 'X', href: 'https://x.com/tuningtoxic' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-grey-400 hover:text-[#ED3237] transition-colors duration-300"
                  aria-label={social.name}
                >
                  {social.name === 'Facebook' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  )}
                  {social.name === 'Instagram' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  )}
                  {social.name === 'YouTube' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )}
                  {social.name === 'X' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
