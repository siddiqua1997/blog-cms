import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import LogoutButton from './components/LogoutButton';

/**
 * Admin Dashboard
 *
 * Clean, bright admin panel with colorful UI elements.
 * White background with vibrant blues, greens, and other colors.
 */

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalComments,
    pendingComments,
    unreadMessages,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.comment.count(),
    prisma.comment.count({ where: { approved: false } }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - White with subtle shadow */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-white">T</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-gray-900">ToxicTuning</span>
                  <span className="text-xs text-gray-500 block">Admin Panel</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm hidden md:block">
                Welcome, <span className="font-medium text-gray-900">{session.user.name}</span>
              </span>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                View Site
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your content and activity</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={totalPosts}
            subtitle={`${publishedPosts} published, ${draftPosts} drafts`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Comments"
            value={totalComments}
            subtitle={pendingComments > 0 ? `${pendingComments} pending review` : 'All approved'}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            color={pendingComments > 0 ? 'amber' : 'green'}
            badge={pendingComments > 0 ? pendingComments : undefined}
          />
          <StatCard
            title="Messages"
            value={unreadMessages}
            subtitle="Unread messages"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            color={unreadMessages > 0 ? 'rose' : 'gray'}
            badge={unreadMessages > 0 ? unreadMessages : undefined}
          />
          <StatCard
            title="Publish Rate"
            value={totalPosts > 0 ? `${Math.round((publishedPosts / totalPosts) * 100)}%` : '0%'}
            subtitle="Of total posts"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="emerald"
          />
        </div>

        {/* Quick Actions & Recent Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction
                href="/admin/posts"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                label="Manage Posts"
                color="blue"
              />
              <QuickAction
                href="/admin/posts/new"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                }
                label="New Post"
                color="green"
              />
              <QuickAction
                href="/admin/comments"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                }
                label="Comments"
                color="purple"
                badge={pendingComments > 0 ? pendingComments : undefined}
              />
              <QuickAction
                href="/admin/contacts"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                label="Messages"
                color="orange"
                badge={unreadMessages > 0 ? unreadMessages : undefined}
              />
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
              <Link href="/admin/posts" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No posts yet</p>
                <Link href="/admin/posts/new" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Create your first post →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}/edit`}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {post.createdAt.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full ${
                      post.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Stat Card Component with colorful themes
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'gray',
  badge,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'rose' | 'emerald' | 'purple' | 'gray';
  badge?: number;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const badgeColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
    emerald: 'bg-emerald-600',
    purple: 'bg-purple-600',
    gray: 'bg-gray-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
      {badge !== undefined && (
        <span className={`absolute -top-2 -right-2 w-6 h-6 ${badgeColors[color]} text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm`}>
          {badge}
        </span>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

// Quick Action Component with colorful icons
function QuickAction({
  href,
  icon,
  label,
  color = 'blue',
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  badge?: number;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  };

  const badgeColors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all relative group"
    >
      {badge !== undefined && (
        <span className={`absolute -top-1 -right-1 w-5 h-5 ${badgeColors[color]} text-white text-xs font-bold rounded-full flex items-center justify-center`}>
          {badge}
        </span>
      )}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${colorClasses[color]}`}>
        {icon}
      </div>
      <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
    </Link>
  );
}
