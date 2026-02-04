'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Admin - Edit Post Page
 *
 * Clean, bright admin page with colorful UI elements.
 * White background with blue primary actions.
 */

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
};

type UploadedImage = {
  url: string;
  publicId: string;
  name: string;
};

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  // Post data
  const [post, setPost] = useState<Post | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  // Unwrap params and fetch post on mount
  useEffect(() => {
    async function init() {
      const { id } = await params;
      await fetchPost(id);
    }
    init();
  }, [params]);

  async function fetchPost(id: string) {
    try {
      const response = await fetch(`/api/admin/posts/${id}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setPublished(data.published);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        const payload = data.data ?? data;
        setUploadedImages((prev) => [
          ...prev,
          { url: payload.url, publicId: payload.publicId, name: file.name },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const insertImage = (image: UploadedImage) => {
    const markdown = `![${image.name}](${image.url})`;
    setContent((prev) => prev + '\n' + markdown + '\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, published }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state (no post found)
  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-xl mx-auto text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-500 mb-6">The post you are looking for could not be found.</p>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Posts
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Post?</h3>
              <p className="text-gray-500">
                This will permanently delete <strong>{post?.title}</strong> and all its comments.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Posts
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              {post && (
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span className="text-sm">Slug:</span>
                  <code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-700">{post.slug}</code>
                </p>
              )}
            </div>
            {post?.published && (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Site
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content (Markdown) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showMarkdownHelp ? 'Hide' : 'Show'} Markdown Help
                      </button>
                    </div>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={20}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
                    />
                  </div>

                  {/* Markdown Help */}
                  {showMarkdownHelp && (
                    <div className="bg-blue-50 rounded-lg p-4 text-sm border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-3">Markdown Reference</h4>
                      <div className="grid grid-cols-2 gap-4 text-gray-600">
                        <div>
                          <code className="bg-white px-2 py-1 rounded border"># Heading 1</code>
                          <p className="text-xs mt-1 text-gray-500">Main heading</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">## Heading 2</code>
                          <p className="text-xs mt-1 text-gray-500">Sub heading</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">**bold**</code>
                          <p className="text-xs mt-1 text-gray-500">Bold text</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">*italic*</code>
                          <p className="text-xs mt-1 text-gray-500">Italic text</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">~~strikethrough~~</code>
                          <p className="text-xs mt-1 text-gray-500">Strikethrough</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">[Link](url)</code>
                          <p className="text-xs mt-1 text-gray-500">Hyperlink</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">![Alt](url)</code>
                          <p className="text-xs mt-1 text-gray-500">Image</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">- item</code>
                          <p className="text-xs mt-1 text-gray-500">Bullet list</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">1. item</code>
                          <p className="text-xs mt-1 text-gray-500">Numbered list</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">- [x] task</code>
                          <p className="text-xs mt-1 text-gray-500">Checklist item</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">{`> quote`}</code>
                          <p className="text-xs mt-1 text-gray-500">Blockquote</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">`inline code`</code>
                          <p className="text-xs mt-1 text-gray-500">Inline code</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">{'```js\\ncode\\n```'}</code>
                          <p className="text-xs mt-1 text-gray-500">Code block</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">---</code>
                          <p className="text-xs mt-1 text-gray-500">Horizontal rule</p>
                        </div>
                        <div>
                          <code className="bg-white px-2 py-1 rounded border">{'| A | B |\\n| - | - |\\n| 1 | 2 |'}</code>
                          <p className="text-xs mt-1 text-gray-500">Table</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Publish Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">
                      {published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <Link
                      href="/admin/posts"
                      className="px-5 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="ml-auto text-red-500 hover:text-red-600 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar - Image Upload */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Images
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload images and click to insert them into your content.
                </p>

                {/* Upload Button */}
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <svg className="animate-spin w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-gray-500">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">Click to upload</span>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Uploaded ({uploadedImages.length})
                    </p>
                    {uploadedImages.map((image, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertImage(image)}
                        className="w-full flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-left group border border-gray-200"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
                          <p className="text-xs text-blue-600 group-hover:text-blue-700">Click to insert</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
