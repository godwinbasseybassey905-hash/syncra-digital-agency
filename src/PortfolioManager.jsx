import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const defaults = {
  eyebrow: 'OUR CREATIVE WORK',
  heading: 'Ideas brought to life.',
  intro:
    'Explore selected work from our creative portfolio. Each project reflects a thoughtful blend of creativity, strategy and execution.',
  emptyTitle: 'OUR NEXT GREAT PROJECT COULD BE YOURS.',
  emptyLabel: 'PORTFOLIO COMING SOON',
};

export default function PortfolioManager() {
  const [content, setContent] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'portfolio')
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage(`Could not load portfolio settings: ${error.message}`);
        setMessageType('error');
      } else if (data?.content) {
        setContent({ ...defaults, ...data.content });
      }

      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  function update(field, value) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();

    if (!content.heading?.trim()) {
      setMessage('Main heading is required.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');
    setMessageType('');

    const payload = {
      eyebrow: (content.eyebrow || '').trim(),
      heading: content.heading.trim(),
      intro: (content.intro || '').trim(),
      emptyTitle: (content.emptyTitle || '').trim(),
      emptyLabel: (content.emptyLabel || '').trim(),
    };

    const { error } = await supabase
      .from('site_content')
      .upsert(
        {
          id: 'portfolio',
          content: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    setSaving(false);

    if (error) {
      setMessage(`Save failed: ${error.message}`);
      setMessageType('error');
    } else {
      setContent(payload);
      setMessage('Portfolio section settings saved successfully.');
      setMessageType('success');
    }
  }

  if (loading) {
    return (
      <p className="portfolio-manager-loading">Loading portfolio settings…</p>
    );
  }

  return (
    <form className="portfolio-manager" onSubmit={save}>
      <div className="portfolio-manager-intro">
        <span>PUBLIC WEBSITE CONTENT</span>
        <h2>Portfolio section</h2>
        <p>
          Edit the portfolio section heading, introductory copy, and empty-state
          messaging. Manage individual published projects in Portfolio Projects.
        </p>
      </div>

      {message && (
        <p
          className={`admin-status-message ${
            messageType ? `is-${messageType}` : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <div className="admin-dark-card">
        <h3>Section copy &amp; empty state</h3>

        <div className="portfolio-manager-two-col">
          <label htmlFor="portfolio-eyebrow">
            Section label
            <input
              id="portfolio-eyebrow"
              value={content.eyebrow}
              onChange={(event) => update('eyebrow', event.target.value)}
            />
          </label>

          <label htmlFor="portfolio-heading">
            Main heading *
            <input
              id="portfolio-heading"
              value={content.heading}
              onChange={(event) => update('heading', event.target.value)}
              required
            />
          </label>
        </div>

        <label htmlFor="portfolio-intro">
          Introduction
          <textarea
            id="portfolio-intro"
            rows="4"
            value={content.intro}
            onChange={(event) => update('intro', event.target.value)}
          />
        </label>

        <div className="portfolio-manager-two-col">
          <label htmlFor="portfolio-empty-title">
            Empty portfolio message
            <input
              id="portfolio-empty-title"
              value={content.emptyTitle}
              onChange={(event) => update('emptyTitle', event.target.value)}
            />
          </label>

          <label htmlFor="portfolio-empty-label">
            Empty portfolio label
            <input
              id="portfolio-empty-label"
              value={content.emptyLabel}
              onChange={(event) => update('emptyLabel', event.target.value)}
            />
          </label>
        </div>

        <span className="admin-field-help">
          These texts display automatically whenever zero published projects
          exist in the portfolio database.
        </span>

        <div className="admin-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save portfolio section'}
          </button>
        </div>
      </div>
    </form>
  );
}
