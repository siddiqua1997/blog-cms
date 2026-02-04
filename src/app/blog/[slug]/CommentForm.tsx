'use client';

import { useState, FormEvent } from 'react';

/**
 * Comment Form Component
 *
 * Premium dark theme form for submitting comments on blog posts.
 * Matches Toxic Tuning's visual design system.
 */

type Props = {
  postId: string;
};

export default function CommentForm({ postId }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          name,
          email: email || undefined,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setContent('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit comment');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-pure-white mb-2">Thank You!</h4>
        <p className="text-grey-400 mb-4">
          Your comment has been submitted and is awaiting approval.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-red-primary hover:underline font-medium"
        >
          Submit another comment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="bg-red-primary/10 border border-red-primary/20 text-red-primary px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium text-grey-700 mb-2">
            Name <span className="text-red-primary">*</span>
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="Your name"
            className="form-input form-input-light"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="comment-email" className="block text-sm font-medium text-grey-700 mb-2">
            Email <span className="text-grey-500">(optional)</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="form-input form-input-light"
          />
          <p className="text-xs text-grey-500 mt-1">Not displayed publicly</p>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment-content" className="block text-sm font-medium text-grey-700 mb-2">
          Comment <span className="text-red-primary">*</span>
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          maxLength={2000}
          rows={5}
          placeholder="Write your comment..."
          className="form-input form-input-light resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Post Comment'
        )}
      </button>
    </form>
  );
}
