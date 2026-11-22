import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const defaults = {
  eyebrow: 'OUR VALUES',
  heading: 'Where Creativity Meets Digital Strategy.',
  intro:
    'We believe meaningful digital experiences are built when creativity, strategy and technology work together. Every decision we make is guided by the value we create for the businesses we serve.',
  vision:
    'To empower businesses with thoughtful digital experiences that make them more visible, memorable and ready for sustainable growth.',
  mission:
    'To combine creativity, technology and strategic thinking to deliver practical digital solutions that help our clients communicate clearly, connect with their audiences and grow with confidence.',
  stats: [
    { value: '0', label: 'Completed Projects' },
    { value: '0', label: 'Happy Clients' },
    { value: '—', label: 'Client Ratings' },
    { value: '—', label: 'Years of Experience' },
  ],
};

export default function ValuesManager() {
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
        .eq('id', 'values')
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage(`Could not load values: ${error.message}`);
        setMessageType('error');
      } else if (data?.content) {
        setContent({
          ...defaults,
          ...data.content,
          stats: defaults.stats.map((item, index) => ({
            ...item,
            ...(data.content.stats?.[index] || {}),
          })),
        });
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

  function updateStat(index, field, value) {
    setContent((current) => ({
      ...current,
      stats: current.stats.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      ),
    }));
  }

  async function save(event) {
    event.preventDefault();

    if (
      !content.heading?.trim() ||
      !content.vision?.trim() ||
      !content.mission?.trim()
    ) {
      setMessage('Main heading, vision statement, and mission statement are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');
    setMessageType('');

    const payload = {
      ...content,
      eyebrow: (content.eyebrow || '').trim(),
      heading: content.heading.trim(),
      intro: (content.intro || '').trim(),
      vision: content.vision.trim(),
      mission: content.mission.trim(),
      stats: content.stats.map((stat) => ({
        value: (stat.value || '').trim(),
        label: (stat.label || '').trim(),
      })),
    };

    const { error } = await supabase
      .from('site_content')
      .upsert(
        { id: 'values', content: payload, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    setSaving(false);

    if (error) {
      setMessage(`Save failed: ${error.message}`);
      setMessageType('error');
    } else {
      setContent(payload);
      setMessage('Our Values section has been saved successfully.');
      setMessageType('success');
    }
  }

  if (loading) {
    return (
      <p className="values-manager-loading">Loading Our Values settings…</p>
    );
  }

  return (
    <form className="values-manager" onSubmit={save}>
      <div className="values-manager-intro">
        <span>PUBLIC WEBSITE CONTENT</span>
        <h2>Our Values section</h2>
        <p>
          Edit the heading, introduction, vision, mission, and four agency
          metrics shown across the About page and values section.
        </p>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`admin-status-message ${
            messageType ? `is-${messageType}` : ''
          }`}
        >
          {message}
        </p>
      )}

      <div className="homepage-editor-card">
        <h3>Core identity &amp; statements</h3>

        <div className="values-manager-two-col">
          <label htmlFor="values-eyebrow">
            Section label
            <input
              id="values-eyebrow"
              value={content.eyebrow}
              onChange={(e) => update('eyebrow', e.target.value)}
            />
          </label>

          <label htmlFor="values-heading">
            Main heading *
            <input
              id="values-heading"
              value={content.heading}
              onChange={(e) => update('heading', e.target.value)}
              required
            />
          </label>
        </div>

        <label htmlFor="values-intro">
          Introduction
          <textarea
            id="values-intro"
            rows="4"
            value={content.intro}
            onChange={(e) => update('intro', e.target.value)}
          />
        </label>

        <div className="values-manager-two-col">
          <label htmlFor="values-vision">
            Vision statement *
            <textarea
              id="values-vision"
              rows="5"
              value={content.vision}
              onChange={(e) => update('vision', e.target.value)}
              required
            />
          </label>

          <label htmlFor="values-mission">
            Mission statement *
            <textarea
              id="values-mission"
              rows="5"
              value={content.mission}
              onChange={(e) => update('mission', e.target.value)}
              required
            />
          </label>
        </div>
      </div>

      <div className="homepage-editor-card">
        <div className="values-manager-stats-heading">
          <h3>Statistics</h3>
          <p>
            Use verified figures only. You can leave unconfirmed figures as 0 or
            —.
          </p>
        </div>

        <div className="values-manager-stats">
          {content.stats.map((stat, index) => (
            <div className="values-manager-stat" key={index}>
              <span>STAT {String(index + 1).padStart(2, '0')}</span>
              <label htmlFor={`values-stat-value-${index}`}>
                Value
                <input
                  id={`values-stat-value-${index}`}
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                />
              </label>
              <label htmlFor={`values-stat-label-${index}`}>
                Label
                <input
                  id={`values-stat-label-${index}`}
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="values-manager-actions">
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save Our Values'}
        </button>
      </div>
    </form>
  );
}
