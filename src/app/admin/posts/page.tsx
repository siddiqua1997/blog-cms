import Link from 'next/link';
import prisma from '@/lib/prisma';
import { deletePost, togglePostPublished } from '@/lib/actions';

/**
 * Admin Posts List
 *
 * Clean, bright admin page with colorful status indicators.
 * White background with vibrant colors for actions.
 */

export const dynamic = 'force-dynamic';

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          images: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Posts</h1>
              <p className="text-gray-500 mt-1">{posts.length} total posts</p>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-500 mb-6">Create your first post to get started.</p>
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Title</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Images</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Comments</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            post.published
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {post._count.images}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {post._count.comments}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {post.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <PostActions post={post} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {posts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-gray-900 hover:text-blue-600 flex-1"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{post._count.images} images</span>
                    <span>{post._count.comments} comments</span>
                    <span>
                      {post.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <PostActions post={post} mobile />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PostActions({
  post,
  mobile = false,
}: {
  post: { id: string; slug: string; published: boolean };
  mobile?: boolean;
}) {
  const baseButtonClass = mobile
    ? 'px-3 py-1.5 text-sm rounded-lg transition-colors'
    : 'p-2 rounded-lg transition-colors hover:bg-gray-100';

  return (
    <div className={`flex ${mobile ? 'gap-2' : 'justify-end gap-1'}`}>
      {post.published && (
        <Link
          href={`/blog/${post.slug}`}
          target="_blank"
          className={`${baseButtonClass} text-gray-500 hover:text-gray-700 ${mobile ? 'bg-gray-100' : ''}`}
          title="View on site"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </Link>
      )}

      <Link
        href={`/admin/posts/${post.id}/edit`}
        className={`${baseButtonClass} text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${mobile ? 'bg-blue-50' : ''}`}
        title="Edit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>

      <form action={togglePostPublished.bind(null, post.id)} className="inline">
        <button
          type="submit"
          className={`${baseButtonClass} ${
            post.published
              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
          } ${mobile ? (post.published ? 'bg-amber-50' : 'bg-green-50') : ''}`}
          title={post.published ? 'Unpublish' : 'Publish'}
        >
          {post.published ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </form>

      <form action={deletePost.bind(null, post.id)} className="inline">
        <button
          type="submit"
          className={`${baseButtonClass} text-red-500 hover:text-red-600 hover:bg-red-50 ${mobile ? 'bg-red-50' : ''}`}
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </form>
    </div>
  );
}
