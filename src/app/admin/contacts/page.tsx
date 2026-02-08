import Link from 'next/link';
import prisma from '@/lib/prisma';
import { deleteContactMessage, markMessageAsRead } from '@/lib/actions';

/**
 * Admin Contact Messages Page
 *
 * Clean, bright admin page with colorful status indicators.
 * White background with vibrant colors for actions.
 */

export const dynamic = 'force-dynamic';

export default async function AdminContactsPage() {
  const listLimit = 200;
  const [messages, unreadCount, readCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' },
      ],
      take: listLimit,
    }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count({ where: { read: true } }),
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
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <div className="flex gap-4 mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {unreadCount} unread
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {readCount} read
            </span>
            {(unreadCount + readCount) > listLimit && (
              <span className="text-sm text-gray-500 self-center">
                showing latest {listLimit}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h2>
            <p className="text-gray-500">Messages from your contact form will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 ${
                  message.read ? 'border-l-gray-300' : 'border-l-blue-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Avatar & Sender Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.read ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      <span className={`font-semibold text-lg ${
                        message.read ? 'text-gray-500' : 'text-blue-600'
                      }`}>
                        {message.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{message.name}</span>
                        {!message.read && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            New
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${message.email}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {message.email}
                      </a>
                      <p className="text-gray-700 mt-3 whitespace-pre-wrap">{message.message}</p>
                      <p className="text-sm text-gray-500 mt-3">
                        {message.createdAt.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:flex-shrink-0">
                    <MessageActions message={message} />
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
 * Message Actions Component
 * Colorful buttons for mark read/delete actions
 */
function MessageActions({ message }: { message: { id: string; read: boolean; email: string } }) {
  return (
    <>
      {/* Mark as Read (only if unread) */}
      {!message.read && (
        <form action={markMessageAsRead.bind(null, message.id)} className="inline">
          <button
            type="submit"
            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
            title="Mark as read"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </form>
      )}

      {/* Reply via email */}
      <a
        href={`mailto:${message.email}`}
        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Reply"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </a>

      {/* Delete */}
      <form action={deleteContactMessage.bind(null, message.id)} className="inline">
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
