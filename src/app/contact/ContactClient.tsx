'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

/**
 * Contact Page Client Component
 * Handles form state and submission.
 */

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    setErrorDetails([]);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to submit message');
        if (data.details) setErrorDetails(data.details);
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <>
      {/* Page Header - DARK */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-pure-black relative overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(255, 10, 10, 0.4) 0%, transparent 70%)',
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              filter: 'blur(100px)',
            }}
          />
        </div>

        <div className="section-container relative z-10 text-center">
          <p className="text-red-primary font-light tracking-[0.3em] uppercase text-xs mb-6">
            Get In Touch
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-pure-white mb-8">
            Contact <span className="gradient-text-red">Us</span>
          </h1>
          <p className="text-lg text-grey-300 max-w-2xl mx-auto leading-relaxed">
            Ready to unlock your vehicle&apos;s potential? Get in touch with our
            performance specialists today.
          </p>
        </div>
      </section>

      {/* Contact Form Section - WHITE */}
      <section className="section-padding section-light">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Info */}
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl md:text-3xl font-bold text-rich-black mb-6">
                Let&apos;s Talk <span className="text-red-primary">Performance</span>
              </h2>
              <p className="text-grey-600 mb-10 leading-relaxed">
                Whether you&apos;re looking for a Stage 1 tune or a full build, our team
                is here to help you achieve your performance goals. Reach out and
                let&apos;s discuss what&apos;s possible for your vehicle.
              </p>

              {/* Contact Details */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-rich-black mb-1">Visit Our Shop</h3>
                    <p className="text-grey-600">
                      123 Performance Drive<br />
                      Los Angeles, CA 90001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-rich-black mb-1">Call Us</h3>
                    <a href="tel:+13105551234" className="text-grey-600 hover:text-red-primary transition-colors">
                      (310) 555-1234
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-rich-black mb-1">Email Us</h3>
                    <a href="mailto:info@toxictuning.com" className="text-grey-600 hover:text-red-primary transition-colors">
                      info@toxictuning.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-red-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-rich-black mb-1">Business Hours</h3>
                    <p className="text-grey-600">
                      Mon - Fri: 9:00 AM - 6:00 PM<br />
                      Sat: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-rich-black mb-4">Follow Us</h3>
                <div className="flex gap-3">
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
                      className="w-11 h-11 rounded-full bg-grey-100 flex items-center justify-center text-grey-500 hover:bg-red-primary hover:text-pure-white transition-all duration-300"
                      aria-label={social.name}
                    >
                      {social.name === 'Facebook' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      )}
                      {social.name === 'Instagram' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.350.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                        </svg>
                      )}
                      {social.name === 'YouTube' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      )}
                      {social.name === 'X' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form
              className="bg-white rounded-2xl shadow-xl border border-grey-200 p-8 md:p-10 space-y-6 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-rich-black mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-primary/40 focus:border-red-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rich-black mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-primary/40 focus:border-red-primary transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rich-black mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-grey-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-primary/40 focus:border-red-primary transition-colors resize-none"
                  placeholder="Tell us about your vehicle and performance goals..."
                />
              </div>

              {status === 'success' && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">
                  Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}

              {status === 'error' && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  {errorMessage || 'Something went wrong. Please try again.'}
                  {errorDetails.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {errorDetails.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-red-primary hover:bg-red-hover text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-red-primary/20 disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>

              <p className="text-xs text-grey-500 text-center">
                By submitting, you agree to our{' '}
                <Link href="/privacy" className="text-red-primary hover:text-red-hover">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
