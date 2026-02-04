import Link from 'next/link';

/**
 * 404 Not Found Page
 *
 * Displayed when a page or resource is not found.
 * Works with notFound() from next/navigation.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-pure-black flex items-center justify-center px-6 py-16">
      <div className="relative w-full max-w-2xl">
        <div className="absolute -inset-8 bg-red-primary/10 blur-3xl rounded-full" />
        <div className="relative bg-rich-black border border-grey-800 rounded-3xl p-10 md:p-12 text-center shadow-2xl">
          <p className="text-red-primary tracking-[0.35em] text-xs uppercase mb-4">
            Error 404
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pure-white mb-4">
            Page Not Found
          </h1>
          <p className="text-grey-400 text-lg mb-8">
            The page you are looking for doesn&apos;t exist or was moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
            <Link href="/blog" className="btn-secondary">
              Visit Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
