import Link from 'next/link';
import prisma from '@/lib/prisma';
import { toggleCommentApproval, deleteComment } from '@/lib/actions';

/**
 * Admin Comments Moderation Page
 *
 * Clean, bright admin page with colorful status indicators.
 * White background with vibrant colors for actions.
 */

export const dynamic = 'force-dynamic';

export default async function AdminCommentsPage() {
  const listLimit = 200;
  const [comments, pendingCount, approvedCount] = await Promise.all([
    prisma.comment.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        content: true,
        approved: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { approved: 'asc' },
        { createdAt: 'desc' },
      ],
      take: listLimit,
    }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.comment.count({ where: { approved: true } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
          <div className="flex gap-4 mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              {pendingCount} pending
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {approvedCount} approved
            </span>
            {(pendingCount + approvedCount) > listLimit && (
              <span className="text-sm text-gray-500 self-center">
                showing latest {listLimit}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {comments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No comments yet</h2>
            <p className="text-gray-500">Comments will appear here once readers engage with your posts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 ${
                  comment.approved ? 'border-l-green-500' : 'border-l-amber-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Avatar & Author Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      comment.approved ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <span className={`font-semibold text-lg ${
                        comment.approved ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {comment.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{comment.name}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            comment.approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {comment.approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      {comment.email && (
                        <p className="text-sm text-gray-500">{comment.email}</p>
                      )}
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>
                          {comment.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <Link
                          href={`/admin/posts/${comment.post.id}/edit`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {comment.post.title}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:flex-shrink-0">
                    <CommentActions comment={comment} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Comment Actions Component
 * Colorful buttons for approve/delete actions
 */
function CommentActions({ comment }: { comment: { id: string; approved: boolean } }) {
  return (
    <>
      {/* Toggle Approval */}
      <form action={toggleCommentApproval.bind(null, comment.id)} className="inline">
        <button
          type="submit"
          className={`p-2 rounded-lg transition-colors ${
            comment.approved
              ? 'text-amber-600 hover:bg-amber-50'
              : 'text-green-600 hover:bg-green-50'
          }`}
          title={comment.approved ? 'Unapprove' : 'Approve'}
        >
          {comment.approved ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </form>

      {/* Delete */}
      <form action={deleteComment.bind(null, comment.id)} className="inline">
        <button
          type="submit"
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </form>
    </>
  );
}
