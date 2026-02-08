'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState('');

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setValue(q);
  }, [searchParams]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    if (q.length === 0) {
      router.push('/blog');
      return;
    }
    router.push(`/blog?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search posts..."
        className="w-full px-4 py-3 rounded-xl border border-grey-800 bg-pure-black/40 text-pure-white placeholder:text-grey-500 focus:outline-none focus:ring-2 focus:ring-red-primary/50 focus:border-red-primary"
      />
      <button type="submit" className="btn-primary whitespace-nowrap">
        Search
      </button>
      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            router.push('/blog');
          }}
          className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-grey-700 text-grey-200 hover:text-pure-white hover:border-grey-500 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  );
}
