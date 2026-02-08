'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isAllowedImageUrl } from '@/lib/images';

type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  createdAt: string;
  _count?: { comments?: number };
};

type ApiResponse = {
  success: boolean;
  data?: { posts: PostCard[] };
  posts?: PostCard[];
};

export default function BlogSearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostCard[]>([]);

  useEffect(() => {
    document.body.toggleAttribute('data-blog-searching', q.length >= 2);
    return () => {
      document.body.removeAttribute('data-blog-searching');
    };
  }, [q]);

  useEffect(() => {
    if (q.length < 2) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/api/posts?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        if (!active) return;
        const list = data?.data?.posts || data?.posts || [];
        setPosts(list);
      })
      .catch(() => {
        if (!active) return;
        setPosts([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q]);

  if (q.length < 2) return null;

  return (
    <div className="section-container" data-search-results>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-rich-black">
          Search results for “{q}”
        </h2>
        <p className="text-grey-600 mt-1">
          {loading ? 'Searching…' : `${posts.length} result${posts.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-2xl bg-grey-100 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-grey-200">
          <h3 className="text-xl font-semibold text-rich-black mb-2">No results</h3>
          <p className="text-grey-600">Try another search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post) => (
            <article key={post.id} className="card-premium-light rounded-2xl overflow-hidden group">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="aspect-video bg-grey-100 relative overflow-hidden">
                  {post.thumbnail ? (
                    isAllowedImageUrl(post.thumbnail) ? (
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-grey-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-red-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-rich-black mb-2 group-hover:text-red-primary transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-grey-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
