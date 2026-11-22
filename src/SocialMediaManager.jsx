import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { SocialIcon } from './components/Icons';
import {
  DEFAULT_SOCIAL_SETTINGS,
  SOCIAL_PLATFORMS,
} from './hooks/useSocialLinks';

function isValidUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function SocialMediaManager() {
  const [settings, setSettings] = useState(DEFAULT_SOCIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content')
          .eq('id', 'social_media')
          .maybeSingle();

        if (!active) return;

        if (error) {
          setMessage(`Could not load social settings: ${error.message}`);
          setMessageType('error');
        } else if (data?.content) {
          setSettings({
            ...DEFAULT_SOCIAL_SETTINGS,
            ...data.content,
          });
        }
      } catch (err) {
        if (active) {
          setMessage(`Failed to connect: ${err.message}`);
          setMessageType('error');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function handleToggle(platformId) {
    setSettings((current) => ({
      ...current,
      [platformId]: {
        ...(current[platformId] || {}),
        enabled: !current[platformId]?.enabled,
      },
    }));
  }

  function handleUrlChange(platformId, value) {
    setSettings((current) => ({
      ...current,
      [platformId]: {
        ...(current[platformId] || {}),
        url: value,
      },
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    // Validate enabled platforms
    for (const platform of SOCIAL_PLATFORMS) {
      const entry = settings[platform.id];
      if (entry?.enabled) {
        const trimmed = (entry.url || '').trim();
        if (!trimmed) {
          setMessage(
            `Please provide a valid profile URL for ${platform.label}, or disable it.`
          );
          setMessageType('error');
          return;
        }
        if (!isValidUrl(trimmed)) {
          setMessage(
            `The URL for ${platform.label} must be a valid web address starting with https:// or http://`
          );
          setMessageType('error');
          return;
        }
      }
    }

    setSaving(true);
    setMessage('');
    setMessageType('');

    // Clean payload
    const payload = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const entry = settings[platform.id] || {};
      payload[platform.id] = {
        enabled: Boolean(entry.enabled),
        url: (entry.url || '').trim(),
      };
    }

    try {
      const { error } = await supabase.from('site_content').upsert(
        {
          id: 'social_media',
          content: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        throw error;
      }

      setSettings(payload);
      setMessage(
        'Social media settings saved successfully. Enabled icons now appear on the public website.'
      );
      setMessageType('success');
    } catch (err) {
      setMessage(`Save failed: ${err.message || 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-dark-manager">
        <p className="admin-muted-note">Loading social media settings…</p>
      </div>
    );
  }

  const enabledCount = SOCIAL_PLATFORMS.filter(
    (p) => settings[p.id]?.enabled && settings[p.id]?.url
  ).length;

  return (
    <form className="admin-dark-manager" onSubmit={handleSave}>
      <div className="admin-section-header">
        <div>
          <span className="admin-section-eyebrow">WEBSITE INTEGRATION</span>
          <h2>Social media settings</h2>
          <p>
            Connect Syncra&apos;s verified social media channels. Enabled
            platforms are displayed as recognizable, clickable icons in the
            website footer, mobile navigation, and contact sections.
          </p>
        </div>
        <div className="portfolio-manager-count">
          <strong>{enabledCount}</strong>
          <span>Active Channels</span>
        </div>
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

      <div className="admin-dark-card">
        <h3>Supported platforms</h3>
        <p className="admin-field-note">
          Toggle a platform on and paste your direct public profile link. Raw
          URLs are never displayed to visitors—they render as sleek, accessible
          icons.
        </p>

        <div className="admin-social-grid">
          {SOCIAL_PLATFORMS.map((platform) => {
            const entry = settings[platform.id] || { enabled: false, url: '' };
            const isEnabled = Boolean(entry.enabled);
            const hasValidUrl = isValidUrl(entry.url);

            return (
              <div
                key={platform.id}
                className={`admin-social-item ${
                  isEnabled ? 'is-enabled' : 'is-disabled'
                }`}
              >
                <div className="admin-social-item__header">
                  <div className="admin-social-item__icon-wrap">
                    <SocialIcon platform={platform.id} />
                  </div>
                  <div>
                    <strong>{platform.label}</strong>
                    <span className="admin-social-item__status">
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <label
                    htmlFor={`toggle-${platform.id}`}
                    className="admin-social-switch"
                  >
                    <input
                      id={`toggle-${platform.id}`}
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(platform.id)}
                    />
                    <span>Toggle {platform.label}</span>
                  </label>
                </div>

                <div className="admin-social-item__body">
                  <label htmlFor={`url-${platform.id}`}>
                    Profile URL
                    <input
                      id={`url-${platform.id}`}
                      type="url"
                      value={entry.url || ''}
                      onChange={(e) =>
                        handleUrlChange(platform.id, e.target.value)
                      }
                      placeholder={platform.placeholder}
                    />
                  </label>

                  {entry.url && hasValidUrl && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-social-preview-link"
                    >
                      Test link ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="admin-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving settings…' : 'Save social media settings'}
          </button>
        </div>
      </div>
    </form>
  );
}
