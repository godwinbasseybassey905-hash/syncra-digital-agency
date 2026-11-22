import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function formatWhatsAppUrl(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0') && digits.length === 11) {
    return `https://wa.me/234${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}

function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [feedback, setFeedback] = useState({ type: 'info', text: '' });

  async function refreshEnquiries() {
    setLoading(true);
    setFeedback({ type: 'info', text: '' });

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load enquiries:', error.message);
      setFeedback({ type: 'error', text: 'Could not load enquiries: ' + error.message });
    } else {
      setEnquiries(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Could not load enquiries:', error.message);
        setFeedback({ type: 'error', text: 'Could not load enquiries: ' + error.message });
      } else {
        setEnquiries(data || []);
      }

      setLoading(false);
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    setFeedback({ type: 'info', text: '' });

    const { error } = await supabase
      .from('enquiries')
      .update({ status: newStatus })
      .eq('id', id);

    setUpdatingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not update enquiry status: ' + error.message });
      return;
    }

    setEnquiries((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    setFeedback({ type: 'success', text: 'Enquiry status updated.' });
  }

  async function deleteEnquiry(id) {
    if (!window.confirm('Are you sure you want to permanently delete this enquiry?')) {
      return;
    }

    setDeletingId(id);
    const { error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', id);
    setDeletingId(null);

    if (error) {
      setFeedback({ type: 'error', text: 'Could not delete enquiry: ' + error.message });
      return;
    }

    setEnquiries((current) => current.filter((item) => item.id !== id));
    setFeedback({ type: 'success', text: 'Enquiry deleted.' });
  }

  const counts = useMemo(() => {
    return {
      all: enquiries.length,
      new: enquiries.filter((item) => (item.status || 'new') === 'new').length,
      in_progress: enquiries.filter((item) => item.status === 'in_progress').length,
      completed: enquiries.filter((item) => item.status === 'completed').length,
    };
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = enquiries.filter((item) => {
      const itemStatus = item.status || 'new';
      if (statusFilter !== 'all' && itemStatus !== statusFilter) return false;
      if (!query) return true;
      return (
        (item.name || '').toLowerCase().includes(query) ||
        (item.email || '').toLowerCase().includes(query) ||
        (item.phone || '').toLowerCase().includes(query) ||
        (item.service || '').toLowerCase().includes(query) ||
        (item.message || '').toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
    });
  }, [enquiries, statusFilter, searchQuery, sortOrder]);

  return (
    <section className="admin-dark-manager enquiries-manager">
      <div className="admin-section-header">
        <div>
          <span className="admin-section-eyebrow">CLIENT COMMUNICATION</span>
          <h2>Contact Enquiries ({enquiries.length})</h2>
          <p>Review incoming messages, filter by status, and track follow-up progress.</p>
        </div>

        <button
          type="button"
          className="admin-btn-secondary"
          onClick={refreshEnquiries}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Enquiries'}
        </button>
      </div>

      <div className="portfolio-manager-stats">
        <div>
          <strong>{counts.new}</strong>
          <span>New</span>
        </div>
        <div>
          <strong>{counts.in_progress}</strong>
          <span>In Progress</span>
        </div>
        <div>
          <strong>{counts.completed}</strong>
          <span>Completed</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-search">
          <label htmlFor="enquiries-search" className="skip-link">
            Search enquiries
          </label>
          <input
            id="enquiries-search"
            type="search"
            placeholder="Search by name, email, service, or message..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <div className="admin-toolbar-filters" role="group" aria-label="Filter enquiries by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`admin-filter-chip ${statusFilter === filter.value ? 'is-active' : ''}`}
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label} ({counts[filter.value]})
            </button>
          ))}

          <label htmlFor="enquiries-sort" className="skip-link">
            Sort enquiries by date
          </label>
          <select
            id="enquiries-sort"
            className="admin-sort-select"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
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

      {loading && <p className="admin-muted-note">Loading enquiries...</p>}

      {!loading && enquiries.length === 0 && (
        <div className="admin-empty-card">
          <p>No enquiries received yet. Messages sent through the Contact form will appear here.</p>
        </div>
      )}

      {!loading && enquiries.length > 0 && filteredEnquiries.length === 0 && (
        <div className="admin-empty-card">
          <p>No enquiries match your current search or status filter.</p>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => {
              setStatusFilter('all');
              setSearchQuery('');
            }}
          >
            Reset filters
          </button>
        </div>
      )}

      <div className="admin-enquiries-list">
        {filteredEnquiries.map((item) => {
          const waUrl = formatWhatsAppUrl(item.phone);
          return (
            <article key={item.id} className="admin-record-card enquiry-card">
              <div className="enquiry-card-header">
                <div>
                  <h3>{item.name}</h3>
                  <small>
                    Received:{' '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : 'Date unavailable'}
                  </small>
                </div>
                <span className={`admin-pill-badge status-${item.status || 'new'}`}>
                  {(item.status || 'new').replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="enquiry-meta-grid">
                <p>
                  <strong>Email:</strong> {item.email}
                </p>
                <p>
                  <strong>Phone:</strong> {item.phone || 'Not provided'}
                </p>
                <p>
                  <strong>Service:</strong> {item.service || 'Not specified'}
                </p>
              </div>

              <div className="enquiry-message-box">
                <strong>Message</strong>
                <p>{item.message}</p>
              </div>

              <div className="enquiry-card-footer">
                <label htmlFor={`enquiry-status-${item.id}`}>
                  Update status
                  <select
                    id={`enquiry-status-${item.id}`}
                    value={item.status || 'new'}
                    disabled={updatingId === item.id}
                    onChange={(event) => updateStatus(item.id, event.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>

                <div className="enquiry-quick-links">
                  {item.email && (
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(
                        `Re: Your Syncra Digital Agency Enquiry (${item.service || 'Project'})`
                      )}`}
                      className="enquiry-quick-link"
                    >
                      Reply via Email ↗
                    </a>
                  )}
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="enquiry-quick-link is-whatsapp"
                    >
                      WhatsApp ↗
                    </a>
                  )}
                  <button
                    type="button"
                    className="admin-btn-danger"
                    disabled={deletingId === item.id}
                    onClick={() => deleteEnquiry(item.id)}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default EnquiriesManager;
