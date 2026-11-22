import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  formatFileSize,
  uploadToProjectImages,
  validateImageFile,
} from './admin/mediaUpload';

const defaultContent = {
  eyebrow: 'ABOUT THE FOUNDER',
  kicker: 'CREATIVITY MEETS TECHNOLOGY',
  headline: 'Transforming businesses in the digital age.',
  biography:
    'I’m Godwin Bassey Bassey, CEO and Founder of Syncra Digital Agency. I lead a creative team focused on helping businesses build a stronger digital presence through thoughtful design, technology and strategy. At Syncra, we bring ideas to life with digital solutions designed around each client’s goals.',
  founderName: 'Godwin Bassey Bassey',
  founderRole: 'CEO & Founder',
  photoUrl: '',
  photoAlt: 'Godwin Bassey Bassey, CEO and Founder of Syncra Digital Agency',
  buttonText: 'Let’s Work Together',
};

export default function AboutManager() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    let active = true;

    async function loadContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'about')
        .maybeSingle();

      if (!active) return;

      if (error) {
        setMessage(`Could not load About content: ${error.message}`);
        setMessageType('error');
      } else if (data?.content) {
        setContent({
          ...defaultContent,
          eyebrow: data.content.aboutEyebrow ?? defaultContent.eyebrow,
          kicker: data.content.aboutKicker ?? defaultContent.kicker,
          headline: data.content.aboutHeadline ?? defaultContent.headline,
          biography: data.content.aboutBiography ?? defaultContent.biography,
          founderName: data.content.founderName ?? defaultContent.founderName,
          founderRole: data.content.founderRole ?? defaultContent.founderRole,
          photoUrl: data.content.founderPhotoUrl ?? defaultContent.photoUrl,
          photoAlt: data.content.founderPhotoAlt ?? defaultContent.photoAlt,
          buttonText: data.content.aboutButtonText ?? defaultContent.buttonText,
        });
      }

      setLoading(false);
    }

    loadContent();
    return () => {
      active = false;
    };
  }, []);

  function update(field, value) {
    setContent((current) => ({ ...current, [field]: value }));
  }

  async function uploadPhoto(file, inputEl) {
    if (!file) return;

    const check = validateImageFile(file);
    if (!check.valid) {
      setMessage(check.error);
      setMessageType('error');
      if (inputEl) inputEl.value = '';
      return;
    }

    setUploading(true);
    setMessage('');
    setMessageType('');

    try {
      const { publicUrl } = await uploadToProjectImages({
        file,
        folder: 'about',
        fileNamePrefix: 'founder',
        upsert: true,
      });

      update('photoUrl', publicUrl);
      setMessage(
        `Founder photo uploaded (${formatFileSize(
          file.size
        )}). Save your About changes to publish it.`
      );
      setMessageType('success');
    } catch (uploadError) {
      setMessage(uploadError.message || 'Photo upload failed.');
      setMessageType('error');
    } finally {
      setUploading(false);
      if (inputEl) inputEl.value = '';
    }
  }

  async function save(event) {
    event.preventDefault();

    if (!content.headline?.trim() || !content.founderName?.trim()) {
      setMessage('Main heading and founder name are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');
    setMessageType('');

    const trimmed = {
      ...content,
      eyebrow: (content.eyebrow || '').trim(),
      kicker: (content.kicker || '').trim(),
      headline: content.headline.trim(),
      biography: (content.biography || '').trim(),
      founderName: content.founderName.trim(),
      founderRole: (content.founderRole || '').trim(),
      photoUrl: (content.photoUrl || '').trim(),
      photoAlt: (content.photoAlt || '').trim(),
      buttonText: (content.buttonText || '').trim(),
    };

    const { error } = await supabase.from('site_content').upsert(
      {
        id: 'about',
        content: {
          aboutEyebrow: trimmed.eyebrow,
          aboutKicker: trimmed.kicker,
          aboutHeadline: trimmed.headline,
          aboutBiography: trimmed.biography,
          founderName: trimmed.founderName,
          founderRole: trimmed.founderRole,
          founderPhotoUrl: trimmed.photoUrl,
          founderPhotoAlt: trimmed.photoAlt,
          aboutButtonText: trimmed.buttonText,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    setSaving(false);

    if (error) {
      setMessage(`Could not save About section: ${error.message}`);
      setMessageType('error');
    } else {
      setContent(trimmed);
      setMessage(
        'About section saved successfully. Refresh your website to see the changes.'
      );
      setMessageType('success');
    }
  }

  if (loading) {
    return (
      <div className="homepage-editor">
        <p className="admin-muted-note">Loading About section settings…</p>
      </div>
    );
  }

  return (
    <form className="homepage-editor" onSubmit={save}>
      <div className="homepage-editor-intro">
        <span>PUBLIC WEBSITE</span>
        <h2>About us &amp; founder profile</h2>
        <p>
          Edit the founder introduction, biography, portrait photograph, and
          call-to-action shown across the homepage and About page.
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

      <div className="homepage-editor-card">
        <h3>About section content</h3>

        <div className="homepage-editor-two">
          <label htmlFor="about-eyebrow">
            Small section label
            <input
              id="about-eyebrow"
              value={content.eyebrow}
              onChange={(event) => update('eyebrow', event.target.value)}
            />
          </label>

          <label htmlFor="about-kicker">
            Introductory line
            <input
              id="about-kicker"
              value={content.kicker}
              onChange={(event) => update('kicker', event.target.value)}
            />
          </label>
        </div>

        <label htmlFor="about-headline">
          Main heading *
          <textarea
            id="about-headline"
            rows="2"
            value={content.headline}
            onChange={(event) => update('headline', event.target.value)}
            required
          />
        </label>

        <label htmlFor="about-biography">
          Founder biography
          <textarea
            id="about-biography"
            rows="7"
            value={content.biography}
            onChange={(event) => update('biography', event.target.value)}
          />
        </label>

        <div className="homepage-editor-two">
          <label htmlFor="about-founder-name">
            Founder name *
            <input
              id="about-founder-name"
              value={content.founderName}
              onChange={(event) => update('founderName', event.target.value)}
              required
            />
          </label>

          <label htmlFor="about-founder-role">
            Founder position
            <input
              id="about-founder-role"
              value={content.founderRole}
              onChange={(event) => update('founderRole', event.target.value)}
            />
          </label>
        </div>

        <label htmlFor="about-button-text">
          About button text
          <input
            id="about-button-text"
            value={content.buttonText}
            onChange={(event) => update('buttonText', event.target.value)}
          />
        </label>
      </div>

      <div className="homepage-editor-card">
        <h3>Founder photograph</h3>
        <p className="homepage-editor-help">
          Upload a clear, professional portrait (JPG, PNG, WebP, GIF, or AVIF up
          to 5 MB). It appears on the homepage and About page.
        </p>

        {content.photoUrl && (
          <div className="about-editor-photo-preview">
            <img
              src={content.photoUrl}
              alt={content.photoAlt || 'Founder preview'}
            />
          </div>
        )}

        <label htmlFor="about-photo-alt">
          Photo description (alt text)
          <input
            id="about-photo-alt"
            value={content.photoAlt}
            onChange={(event) => update('photoAlt', event.target.value)}
            placeholder="Describe the portrait for screen readers"
          />
        </label>

        <div className="admin-form-actions">
          <label className="homepage-upload-button">
            {uploading ? 'Uploading photo…' : 'Upload founder photograph'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              disabled={uploading}
              onChange={(event) =>
                uploadPhoto(event.target.files?.[0], event.target)
              }
            />
          </label>

          {content.photoUrl && (
            <button
              type="button"
              className="about-remove-photo"
              onClick={() => update('photoUrl', '')}
            >
              Remove photo from About section
            </button>
          )}
        </div>
      </div>

      <div className="admin-form-actions">
        <button
          className="homepage-editor-save"
          type="submit"
          disabled={saving || uploading}
        >
          {saving ? 'Saving About section…' : 'Save About section'}
        </button>
      </div>
    </form>
  );
}
