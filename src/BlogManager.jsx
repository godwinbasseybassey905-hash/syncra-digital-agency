import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  formatFileSize,
  uploadToProjectImages,
  validateImageFile,
} from './admin/mediaUpload';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  published: false,
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editingPublishedAt, setEditingPublishedAt] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState({ type: 'info', text: '' });

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : form.cover_image_url),
    [imageFile, form.cover_image_url]
  );

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imageFile, imagePreview]);

  async function refreshPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setFeedback({ type: 'error', text: 'Could not load blog posts: ' + error.message });
      return;
    }

    setPosts(data || []);
  }

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        setFeedback({ type: 'error', text: 'Could not load blog posts: ' + error.message });
      } else {
        setPosts(data || []);
      }

      setListLoading(false);
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'title' && !editingId) {
        updated.slug = makeSlug(value);
      }

      return updated;
    });
  }

  function handleImageSelect(file) {
    if (!file) {
      setImageFile(null);
      return;
    }
    const check = validateImageFile(file);
    if (!check.valid) {
      setFeedback({ type: 'error', text: check.error });
      const fileInput = document.getElementById('blog-cover-image');
      if (fileInput) fileInput.value = '';
      return;
    }
    setImageFile(file);
    setFeedback({
      type: 'info',
      text: `Cover image ready (${formatFileSize(file.size)}). Save article to upload.`,
    });
  }

  function startEditing(post) {
    setEditingId(post.id);
    setEditingPublishedAt(post.published_at || null);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      published: Boolean(post.published),
    });
    setImageFile(null);
    setFeedback({ type: 'info', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setEditingPublishedAt(null);
    setImageFile(null);

    const fileInput = document.getElementById('blog-cover-image');
    if (fileInput) fileInput.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = form.title.trim();
    const cleanSlug = makeSlug(form.slug || cleanTitle);
    if (!cleanTitle || !cleanSlug || !form.excerpt.trim() || !form.content.trim()) {
      setFeedback({
        type: 'error',
        text: 'Please complete the article title, slug, excerpt, and content before saving.',
      });
      return;
    }

    setSaving(true);
    setFeedback({
      type: 'info',
      text: imageFile ? 'Uploading cover image & saving article…' : 'Saving article…',
    });

    try {
      let imageUrl = form.cover_image_url || '';
      if (imageFile) {
        const uploaded = await uploadToProjectImages({
          file: imageFile,
          folder: 'blog',
          upsert: false,
        });
        imageUrl = uploaded.publicUrl;
      }

      const preservedPublishedAt = form.published
        ? editingId && editingPublishedAt
          ? editingPublishedAt
          : new Date().toISOString()
        : null;

      const postData = {
        title: cleanTitle,
        slug: cleanSlug,
        excerpt: form.excerpt.trim(),
        content: form.content,
        cover_image_url: imageUrl,
        published: form.published,
        published_at: preservedPublishedAt,
      };

      if (editingId) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingId);

        if (error) throw error;

        setFeedback({ type: 'success', text: 'Blog post updated successfully.' });
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);

        if (error) throw error;

        setFeedback({ type: 'success', text: 'Blog post created successfully.' });
      }

      resetForm();
      await refreshPosts();
    } catch (error) {
      setFeedback({ type: 'error', text: 'Error: ' + error.message });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post) {
    setTogglingId(post.id);
    const nextPublished = !post.published;

    const { error } = await supabase
      .from('blog_posts')
      .update({
        published: nextPublished,
        published_at: nextPublished
          ? post.published_at || new Date().toISOString()
          : null,
      })
      .eq('id', post.id);

    setTogglingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not update post: ' + error.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: nextPublished ? 'Blog post published.' : 'Blog post moved back to drafts.',
    });

    await refreshPosts();
  }

  async function deletePost(post) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${post.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(post.id);
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    setDeletingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not delete post: ' + error.message });
      return;
    }

    if (editingId === post.id) resetForm();

    setFeedback({ type: 'success', text: 'Blog post deleted successfully.' });
    await refreshPosts();
  }

  const wordCount = useMemo(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [form.content]);

  const readMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 220)) : 0;
  const publishedCount = posts.filter((post) => post.published).length;

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter === 'published' && !post.published) return false;
      if (statusFilter === 'draft' && post.published) return false;
      if (!q) return true;
      return (
        (post.title || '').toLowerCase().includes(q) ||
        (post.excerpt || '').toLowerCase().includes(q) ||
        (post.slug || '').toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery, statusFilter]);

  return (
    <section className="admin-dark-manager blog-manager">
      <div className="admin-section-header">
        <div>
          <span className="admin-section-eyebrow">CONTENT MANAGEMENT</span>
          <h2>Manage Blog &amp; Insights</h2>
          <p>Create, edit, publish, and organize articles for Syncra Insights.</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={refreshPosts}>
          Refresh
        </button>
      </div>

      <div className="portfolio-manager-stats">
        <div>
          <strong>{posts.length}</strong>
          <span>Total Posts</span>
        </div>
        <div>
          <strong>{publishedCount}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>{posts.length - publishedCount}</strong>
          <span>Drafts</span>
        </div>
      </div>

      {feedback.text && (
        <p
          className={`admin-status-message is-${feedback.type}`}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="admin-dark-card">
        <h3>{editingId ? 'Edit Blog Post' : 'Create New Article'}</h3>

        <div className="admin-form-grid">
          <label htmlFor="blog-title">
            Article Title *
            <input
              id="blog-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter article title"
              required
            />
          </label>

          <label htmlFor="blog-slug">
            URL Slug *
            <input
              id="blog-slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="article-url-slug"
              required
            />
          </label>
        </div>

        <label htmlFor="blog-excerpt">
          Short Excerpt *
          <textarea
            id="blog-excerpt"
            rows="3"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            placeholder="Write a concise summary shown on Insights cards"
            required
          />
        </label>

        <label htmlFor="blog-content">
          Full Article Content *
          <textarea
            id="blog-content"
            rows="10"
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write your full article here. Separate paragraphs with blank lines, and use ## Heading for section titles."
            required
          />
        </label>

        <div className="admin-helper-row">
          <span>Tip: Leave a blank line between paragraphs; start a line with ## for section headings.</span>
          <span>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
            {readMinutes > 0 ? ` · ~${readMinutes} min read` : ''}
          </span>
        </div>

        <div className="portfolio-image-field">
          <label htmlFor="blog-cover-image">Featured Cover Image</label>
          <input
            id="blog-cover-image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={saving}
            onChange={(event) => handleImageSelect(event.target.files?.[0] || null)}
          />
          <span className="portfolio-field-hint">
            JPG, PNG, WebP, GIF, or AVIF up to 5 MB. Stored in project-images/blog.
          </span>

          {imagePreview && (
            <div className="admin-cover-preview">
              <img src={imagePreview} alt="Blog cover preview" />
              <div>
                <strong>
                  {imageFile
                    ? `${imageFile.name} (${formatFileSize(imageFile.size)})`
                    : 'Current saved cover image'}
                </strong>
                <span>
                  {imageFile
                    ? 'Ready to upload when you save.'
                    : 'Currently attached to this article.'}
                </span>
                {imageFile && (
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => {
                      setImageFile(null);
                      const fileInput = document.getElementById('blog-cover-image');
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <label className="manager-checkbox" htmlFor="blog-published">
          <input
            id="blog-published"
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          <span>Publish this article on the website</span>
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Blog Post'
                : 'Create Blog Post'}
          </button>

          {editingId && (
            <button type="button" className="admin-btn-secondary" onClick={resetForm}>
              Cancel Editing
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-heading">
        <h3>All Blog Posts ({posts.length})</h3>
      </div>

      {posts.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label htmlFor="blog-search" className="skip-link">
              Search blog posts
            </label>
            <input
              id="blog-search"
              type="search"
              placeholder="Search articles by title or slug..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="admin-toolbar-filters" role="group" aria-label="Filter articles">
            {[
              { value: 'all', label: 'All' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Drafts' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`admin-filter-chip ${statusFilter === filter.value ? 'is-active' : ''}`}
                aria-pressed={statusFilter === filter.value}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {listLoading ? (
        <p className="admin-muted-note">Loading blog posts...</p>
      ) : posts.length === 0 ? (
        <div className="admin-empty-card">
          <p>No blog posts yet. Create your first article above.</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="admin-empty-card">
          <p>No blog posts match your current filter.</p>
        </div>
      ) : (
        <div className="admin-records-grid">
          {filteredPosts.map((post) => (
            <article key={post.id} className="admin-record-card">
              <div className="admin-record-top">
                {post.cover_image_url && (
                  <img
                    className="admin-record-thumb"
                    src={post.cover_image_url}
                    alt={post.title}
                  />
                )}

                <div className="admin-record-meta">
                  <span
                    className={`admin-pill-badge ${
                      post.published ? 'is-published' : 'is-draft'
                    }`}
                  >
                    {post.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                  <h4>{post.title}</h4>
                  <small>
                    /insights/{post.slug}
                    {post.published_at
                      ? ` · ${new Date(post.published_at).toLocaleDateString()}`
                      : ''}
                  </small>
                </div>
              </div>

              <p className="admin-record-excerpt">{post.excerpt}</p>

              <div className="admin-record-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => startEditing(post)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-btn-success"
                  disabled={togglingId === post.id}
                  onClick={() => togglePublish(post)}
                >
                  {togglingId === post.id
                    ? 'Updating...'
                    : post.published
                      ? 'Unpublish'
                      : 'Publish'}
                </button>

                <button
                  type="button"
                  className="admin-btn-danger"
                  disabled={deletingId === post.id}
                  onClick={() => deletePost(post)}
                >
                  {deletingId === post.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
