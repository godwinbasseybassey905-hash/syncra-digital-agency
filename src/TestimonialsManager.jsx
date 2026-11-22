import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  formatFileSize,
  uploadToProjectImages,
  validateImageFile,
} from './admin/mediaUpload';

const emptyForm = {
  client_name: '',
  company_name: '',
  content: '',
  avatar_url: '',
  published: false,
};

function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState({ type: 'info', text: '' });
  const [form, setForm] = useState(emptyForm);

  async function refreshTestimonials() {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setFeedback({ type: 'error', text: 'Could not load testimonials: ' + error.message });
    } else {
      setTestimonials(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        setFeedback({ type: 'error', text: 'Could not load testimonials: ' + error.message });
      } else {
        setTestimonials(data || []);
      }

      setLoading(false);
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleAvatarUpload(file) {
    if (!file) return;

    const check = validateImageFile(file);
    if (!check.valid) {
      setFeedback({ type: 'error', text: check.error });
      return;
    }

    setUploadingAvatar(true);
    setFeedback({ type: 'info', text: `Uploading avatar (${formatFileSize(file.size)})…` });

    try {
      const uploaded = await uploadToProjectImages({
        file,
        folder: 'testimonials',
        fileNamePrefix: 'avatar',
        upsert: false,
      });
      setForm((current) => ({ ...current, avatar_url: uploaded.publicUrl }));
      setFeedback({
        type: 'success',
        text: 'Client photo uploaded. Save the testimonial to publish changes.',
      });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setUploadingAvatar(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    const fileInput = document.getElementById('testimonial-avatar-file');
    if (fileInput) fileInput.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.client_name.trim() || !form.content.trim()) {
      setFeedback({
        type: 'error',
        text: 'Please provide both the client name and their testimonial text.',
      });
      return;
    }

    setSaving(true);
    setFeedback({ type: 'info', text: '' });

    const testimonialData = {
      client_name: form.client_name.trim(),
      company_name: form.company_name.trim(),
      content: form.content.trim(),
      avatar_url: form.avatar_url.trim() || null,
      published: form.published,
    };

    const result = editingId
      ? await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', editingId)
      : await supabase.from('testimonials').insert([testimonialData]);

    setSaving(false);

    if (result.error) {
      setFeedback({
        type: 'error',
        text: 'Could not save testimonial: ' + result.error.message,
      });
      return;
    }

    setFeedback({
      type: 'success',
      text: editingId
        ? 'Testimonial updated successfully.'
        : 'Testimonial added successfully.',
    });

    resetForm();
    await refreshTestimonials();
  }

  function startEditing(item) {
    setEditingId(item.id);
    setFeedback({ type: 'info', text: '' });

    setForm({
      client_name: item.client_name || '',
      company_name: item.company_name || '',
      content: item.content || '',
      avatar_url: item.avatar_url || '',
      published: Boolean(item.published),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function togglePublish(item) {
    setTogglingId(item.id);
    const nextPublished = !item.published;

    const { error } = await supabase
      .from('testimonials')
      .update({ published: nextPublished })
      .eq('id', item.id);

    setTogglingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not update status: ' + error.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: nextPublished ? 'Testimonial published.' : 'Testimonial hidden.',
    });
    await refreshTestimonials();
  }

  async function deleteTestimonial(item) {
    if (!window.confirm(`Delete testimonial from "${item.client_name}" permanently?`)) {
      return;
    }

    setDeletingId(item.id);
    const { error } = await supabase.from('testimonials').delete().eq('id', item.id);
    setDeletingId(null);

    if (error) {
      setFeedback({
        type: 'error',
        text: 'Could not delete testimonial: ' + error.message,
      });
      return;
    }

    if (editingId === item.id) resetForm();

    setTestimonials((current) => current.filter((row) => row.id !== item.id));
    setFeedback({ type: 'success', text: 'Testimonial deleted successfully.' });
  }

  const publishedCount = testimonials.filter((item) => item.published).length;

  const filteredTestimonials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return testimonials.filter((item) => {
      if (statusFilter === 'published' && !item.published) return false;
      if (statusFilter === 'hidden' && item.published) return false;
      if (!q) return true;
      return (
        (item.client_name || '').toLowerCase().includes(q) ||
        (item.company_name || '').toLowerCase().includes(q) ||
        (item.content || '').toLowerCase().includes(q)
      );
    });
  }, [testimonials, searchQuery, statusFilter]);

  return (
    <section className="admin-dark-manager testimonials-manager">
      <div className="admin-section-header">
        <div>
          <span className="admin-section-eyebrow">SOCIAL PROOF</span>
          <h2>Manage Testimonials</h2>
          <p>Add, edit, and publish authentic feedback from your clients.</p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={refreshTestimonials}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="portfolio-manager-stats">
        <div>
          <strong>{testimonials.length}</strong>
          <span>Total Reviews</span>
        </div>
        <div>
          <strong>{publishedCount}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>{testimonials.length - publishedCount}</strong>
          <span>Hidden</span>
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
        <h3>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>

        <div className="admin-form-grid">
          <label htmlFor="testimonial-client-name">
            Client&apos;s full name *
            <input
              id="testimonial-client-name"
              name="client_name"
              placeholder="Client's full name"
              value={form.client_name}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="testimonial-company-name">
            Company or role (optional)
            <input
              id="testimonial-company-name"
              name="company_name"
              placeholder="e.g. Founder, Acme Ltd"
              value={form.company_name}
              onChange={handleChange}
            />
          </label>
        </div>

        <label htmlFor="testimonial-content">
          Client testimonial *
          <textarea
            id="testimonial-content"
            rows="5"
            name="content"
            placeholder="What did the client say about your work?"
            value={form.content}
            onChange={handleChange}
            required
          />
        </label>

        <div className="portfolio-image-field">
          <div className="admin-form-grid">
            <label htmlFor="testimonial-avatar-url">
              Client photo URL (optional)
              <input
                id="testimonial-avatar-url"
                type="url"
                name="avatar_url"
                placeholder="https://..."
                value={form.avatar_url}
                onChange={handleChange}
              />
            </label>

            <label htmlFor="testimonial-avatar-file">
              Or upload client photo
              <input
                id="testimonial-avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={uploadingAvatar || saving}
                onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
              />
            </label>
          </div>
          <span className="portfolio-field-hint">
            Optional square headshot (JPG, PNG, or WebP up to 5 MB). Stored in project-images/testimonials.
          </span>
        </div>

        <label className="manager-checkbox" htmlFor="testimonial-published">
          <input
            id="testimonial-published"
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />
          <span>Publish this testimonial on the website</span>
        </label>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={saving || uploadingAvatar}
          >
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Testimonial'
                : 'Add Testimonial'}
          </button>

          {editingId && (
            <button type="button" className="admin-btn-secondary" onClick={resetForm}>
              Cancel Editing
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-heading">
        <h3>All Testimonials ({testimonials.length})</h3>
      </div>

      {testimonials.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label htmlFor="testimonials-search" className="skip-link">
              Search testimonials
            </label>
            <input
              id="testimonials-search"
              type="search"
              placeholder="Search by client, company, or quote..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="admin-toolbar-filters" role="group" aria-label="Filter testimonials">
            {[
              { value: 'all', label: 'All' },
              { value: 'published', label: 'Published' },
              { value: 'hidden', label: 'Hidden' },
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

      {loading ? (
        <p className="admin-muted-note">Loading testimonials...</p>
      ) : testimonials.length === 0 ? (
        <div className="admin-empty-card">
          <p>No testimonials added yet.</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="admin-empty-card">
          <p>No testimonials match your current filter.</p>
        </div>
      ) : (
        <div className="admin-records-grid">
          {filteredTestimonials.map((item) => (
            <article key={item.id} className="admin-record-card">
              <div className="admin-record-top">
                {item.avatar_url ? (
                  <img
                    className="admin-avatar-thumb"
                    src={item.avatar_url}
                    alt={item.client_name}
                  />
                ) : (
                  <span className="admin-avatar-fallback" aria-hidden="true">
                    {(item.client_name || 'C').slice(0, 1).toUpperCase()}
                  </span>
                )}

                <div className="admin-record-meta">
                  <span
                    className={`admin-pill-badge ${
                      item.published ? 'is-published' : 'is-draft'
                    }`}
                  >
                    {item.published ? 'Published' : 'Hidden'}
                  </span>
                  <h4>{item.client_name}</h4>
                  {item.company_name && <small>{item.company_name}</small>}
                </div>
              </div>

              <p className="admin-record-excerpt">{item.content}</p>

              <div className="admin-record-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => startEditing(item)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-btn-success"
                  disabled={togglingId === item.id}
                  onClick={() => togglePublish(item)}
                >
                  {togglingId === item.id
                    ? 'Updating...'
                    : item.published
                      ? 'Hide'
                      : 'Publish'}
                </button>

                <button
                  type="button"
                  className="admin-btn-danger"
                  disabled={deletingId === item.id}
                  onClick={() => deleteTestimonial(item)}
                >
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TestimonialsManager;
