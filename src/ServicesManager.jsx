import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  icon: '',
  sort_order: 0,
  is_active: true,
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState({ type: 'info', text: '' });
  const [form, setForm] = useState(emptyForm);

  async function fetchServices() {
    setLoading(true);

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      setFeedback({ type: 'error', text: 'Could not load services: ' + error.message });
    } else {
      setServices(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!active) return;

      if (error) {
        setFeedback({ type: 'error', text: 'Could not load services: ' + error.message });
      } else {
        setServices(data || []);
      }

      setLoading(false);
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  function handleTitleChange(value) {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: editingId ? previous.slug : makeSlug(value),
    }));
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'sort_order'
            ? Number(value) || 0
            : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = form.title.trim();
    const cleanSlug = makeSlug(form.slug || cleanTitle);
    if (!cleanTitle || !cleanSlug) {
      setFeedback({ type: 'error', text: 'Please enter a valid service title and URL slug.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: 'info', text: '' });

    const serviceData = {
      title: cleanTitle,
      slug: cleanSlug,
      description: form.description.trim(),
      icon: form.icon.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: Boolean(form.is_active),
    };

    const result = editingId
      ? await supabase.from('services').update(serviceData).eq('id', editingId)
      : await supabase.from('services').insert([serviceData]);

    if (result.error) {
      setFeedback({ type: 'error', text: 'Could not save service: ' + result.error.message });
    } else {
      setFeedback({
        type: 'success',
        text: editingId ? 'Service updated successfully.' : 'Service added successfully.',
      });
      setForm(emptyForm);
      setEditingId(null);
      await fetchServices();
    }

    setSaving(false);
  }

  function editService(service) {
    setForm({
      title: service.title || '',
      slug: service.slug || '',
      description: service.description || '',
      icon: service.icon || '',
      sort_order: service.sort_order ?? 0,
      is_active: Boolean(service.is_active),
    });

    setEditingId(service.id);
    setFeedback({ type: 'info', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function toggleActive(service) {
    setTogglingId(service.id);
    const nextActive = !service.is_active;

    const { error } = await supabase
      .from('services')
      .update({ is_active: nextActive })
      .eq('id', service.id);

    setTogglingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not update visibility: ' + error.message });
      return;
    }

    setFeedback({
      type: 'success',
      text: nextActive ? `"${service.title}" is now visible publicly.` : `"${service.title}" hidden from public website.`,
    });
    await fetchServices();
  }

  async function deleteService(service) {
    if (!window.confirm(`Delete "${service.title}" permanently?`)) return;

    setDeletingId(service.id);
    const { error } = await supabase.from('services').delete().eq('id', service.id);
    setDeletingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not delete service: ' + error.message });
    } else {
      if (editingId === service.id) cancelEdit();
      setFeedback({ type: 'success', text: 'Service deleted successfully.' });
      await fetchServices();
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFeedback({ type: 'info', text: '' });
  }

  const activeCount = services.filter((item) => item.is_active).length;

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((item) => {
      if (statusFilter === 'active' && !item.is_active) return false;
      if (statusFilter === 'hidden' && item.is_active) return false;
      if (!q) return true;
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.slug || '').toLowerCase().includes(q)
      );
    });
  }, [services, searchQuery, statusFilter]);

  return (
    <section className="services-manager admin-dark-manager">
      <div className="admin-section-header">
        <div>
          <span className="admin-section-eyebrow">SERVICE CATALOGUE</span>
          <h2>Manage Services</h2>
          <p>Add, edit, reorder, show, or hide the services displayed on your website and enquiry form.</p>
        </div>

        <button type="button" className="admin-btn-secondary" onClick={fetchServices} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="portfolio-manager-stats">
        <div>
          <strong>{services.length}</strong>
          <span>Total Services</span>
        </div>
        <div>
          <strong>{activeCount}</strong>
          <span>Active Publicly</span>
        </div>
        <div>
          <strong>{services.length - activeCount}</strong>
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

      <form onSubmit={handleSubmit} className="manager-form admin-dark-card">
        <h3>{editingId ? 'Edit Service' : 'Add New Service'}</h3>

        <div className="admin-form-grid">
          <label htmlFor="service-title">
            Service title *
            <input
              id="service-title"
              name="title"
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="e.g. Website Design & Development"
              required
            />
          </label>

          <label htmlFor="service-slug">
            URL slug *
            <input
              id="service-slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="website-design-development"
              required
            />
          </label>
        </div>

        <label htmlFor="service-description">
          Description
          <textarea
            id="service-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe how this service helps your clients."
          />
        </label>

        <div className="admin-form-grid">
          <label htmlFor="service-icon">
            Icon (optional emoji or icon key)
            <input
              id="service-icon"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="Leave blank for automatic vector icon"
            />
          </label>

          <label htmlFor="service-order">
            Display order
            <input
              id="service-order"
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="manager-checkbox" htmlFor="service-active">
          <input
            id="service-active"
            name="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={handleChange}
          />
          <span>Show this service publicly on the website</span>
        </label>

        <div className="admin-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
          </button>

          {editingId && (
            <button type="button" className="admin-btn-secondary" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-heading">
        <h3>Existing Services ({services.length})</h3>
      </div>

      {services.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label htmlFor="services-search" className="skip-link">
              Search services
            </label>
            <input
              id="services-search"
              type="search"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="admin-toolbar-filters" role="group" aria-label="Filter services">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
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
        <p className="admin-muted-note">Loading services...</p>
      ) : services.length === 0 ? (
        <div className="admin-empty-card">
          <p>No custom services stored in Supabase yet. Add services above to manage your public catalogue.</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="admin-empty-card">
          <p>No services match your current filter.</p>
        </div>
      ) : (
        <div className="manager-list">
          {filteredServices.map((service) => (
            <article key={service.id} className="manager-item">
              <div>
                <div className="portfolio-admin-card-meta" style={{ marginBottom: '8px' }}>
                  <span>Order #{service.sort_order ?? 0}</span>
                  <span className={`admin-pill-badge ${service.is_active ? 'is-published' : 'is-draft'}`}>
                    {service.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <strong>
                  {service.icon ? `${service.icon} ` : ''}
                  {service.title}
                </strong>
                <p>{service.description || 'No description added yet.'}</p>
                <small>/{service.slug}</small>
              </div>

              <div className="manager-actions">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => editService(service)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="admin-btn-success"
                  disabled={togglingId === service.id}
                  onClick={() => toggleActive(service)}
                >
                  {togglingId === service.id
                    ? 'Updating...'
                    : service.is_active
                      ? 'Hide'
                      : 'Show'}
                </button>
                <button
                  type="button"
                  className="admin-btn-danger"
                  disabled={deletingId === service.id}
                  onClick={() => deleteService(service)}
                >
                  {deletingId === service.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ServicesManager;
