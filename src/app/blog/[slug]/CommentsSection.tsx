'use client';

import { useEffect, useState } from 'react';

type Comment = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  data?: { comments: Comment[] };
  comments?: Comment[];
};

type Props = {
  postId: string;
};

export default function CommentsSection({ postId }: Props) {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}&limit=50`);
        const data: ApiResponse = await res.json();
        if (!res.ok) {
          throw new Error((data as { error?: string })?.error || 'Failed to load comments');
        }
        if (!active) return;
        const list = data?.data?.comments || data?.comments || [];
        setComments(list);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [postId]);

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-bold text-rich-black mb-10">
        Comments <span className="text-red-primary">({loading ? '…' : comments.length})</span>
      </h2>

      {loading ? (
        <div className="space-y-4 mb-12">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl p-6 bg-white border border-grey-200 shadow-sm">
              <div className="h-4 w-40 bg-grey-100 rounded mb-3 animate-pulse" />
              <div className="h-3 w-24 bg-grey-100 rounded mb-5 animate-pulse" />
              <div className="h-3 w-full bg-grey-100 rounded mb-2 animate-pulse" />
              <div className="h-3 w-5/6 bg-grey-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-grey-600 mb-12">
          Unable to load comments right now.
        </p>
      ) : comments.length === 0 ? (
        <p className="text-grey-600 mb-12">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-6 mb-12">
          {comments.map((comment) => {
            const createdAt = new Date(comment.createdAt);
            return (
              <div
                key={comment.id}
                className="rounded-2xl p-6 bg-pure-white border border-grey-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-grey-100 flex items-center justify-center">
                    <span className="text-grey-700 font-semibold text-sm">
                      {comment.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-rich-black">{comment.name}</p>
                    <time className="text-sm text-grey-500">
                      {createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
                <p className="text-grey-700 leading-relaxed">{comment.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
