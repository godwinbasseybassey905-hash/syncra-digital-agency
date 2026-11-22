import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  formatFileSize,
  uploadToProjectImages,
  validateImageFile,
} from './admin/mediaUpload';

const defaultContent = {
  eyebrow: 'DIGITAL EXCELLENCE, REDEFINED',
  headline: 'Your one-stop solution for digital excellence.',
  description:
    'Specializing in creating stunning websites, captivating graphics, engaging videos, captivating social media presence, and crafting compelling content that resonates with your audience.',
  primaryButton: 'Book My Free Consultation',
  secondaryButton: 'See Our Work',
  highlightNumber: '0',
  highlightLabel: 'Completed Projects',
  slides: [
    {
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2400&q=90',
      label: 'DIGITAL EXPERIENCES',
      caption: 'Thoughtful design. Powerful digital experiences.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2400&q=90',
      label: 'CREATIVE COLLABORATION',
      caption: 'Great ideas grow through brilliant teamwork.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2400&q=90',
      label: 'BRAND STORYTELLING',
      caption: 'Creative work that makes your brand memorable.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2400&q=90',
      label: 'SMART TECHNOLOGY',
      caption: 'Turning technology into real-world value.',
    },
    {
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2400&q=90',
      label: 'BUSINESS GROWTH',
      caption: 'Creating smarter ways for businesses to grow.',
    },
  ],
};

export default function HomepageManager() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [uploading, setUploading] = useState(-1);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'homepage')
        .maybeSingle();

      if (!active) return;

      if (!error && data?.content) {
        const saved = data.content;

        setContent({
          ...defaultContent,
          ...saved,
          headline: saved.headline?.trim() || defaultContent.headline,
          description: saved.description?.trim() || defaultContent.description,
          highlightNumber:
            saved.highlightNumber?.trim() || defaultContent.highlightNumber,
          highlightLabel:
            saved.highlightLabel?.trim() || defaultContent.highlightLabel,
          slides:
            Array.isArray(saved.slides) && saved.slides.length > 0
              ? saved.slides
              : defaultContent.slides,
        });
      }

      if (error) {
        setMessage(`Could not load saved homepage content: ${error.message}`);
        setMessageType('error');
      }

      setLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  function update(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateSlide(index, field, value) {
    setContent((current) => ({
      ...current,
      slides: current.slides.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide
      ),
    }));
  }

  async function uploadSlide(index, file, inputEl) {
    if (!file) return;

    const check = validateImageFile(file);
    if (!check.valid) {
      setMessage(check.error);
      setMessageType('error');
      if (inputEl) inputEl.value = '';
      return;
    }

    setUploading(index);
    setMessage('');
    setMessageType('');

    try {
      const { publicUrl } = await uploadToProjectImages({
        file,
        folder: 'homepage',
        fileNamePrefix: `hero-${index}`,
        upsert: true,
      });

      updateSlide(index, 'image', publicUrl);
      setMessage(
        `Slide ${index + 1} image uploaded (${formatFileSize(
          file.size
        )}). Save homepage changes to publish it.`
      );
      setMessageType('success');
    } catch (uploadError) {
      setMessage(uploadError.message || 'Image upload failed.');
      setMessageType('error');
    } finally {
      setUploading(-1);
      if (inputEl) inputEl.value = '';
    }
  }

  async function save(event) {
    event.preventDefault();

    if (!content.headline?.trim() || !content.description?.trim()) {
      setMessage('Main headline and supporting description are required.');
      setMessageType('error');
      return;
    }

    setSaving(true);
    setMessage('');
    setMessageType('');

    const payload = {
      ...content,
      eyebrow: (content.eyebrow || '').trim(),
      headline: content.headline.trim(),
      description: content.description.trim(),
      primaryButton: (content.primaryButton || '').trim(),
      secondaryButton: (content.secondaryButton || '').trim(),
      highlightNumber: (content.highlightNumber || '').trim(),
      highlightLabel: (content.highlightLabel || '').trim(),
    };

    const { error } = await supabase.from('site_content').upsert(
      {
        id: 'homepage',
        content: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    setSaving(false);

    if (error) {
      setMessage(`Could not save homepage changes: ${error.message}`);
      setMessageType('error');
    } else {
      setContent(payload);
      setMessage(
        'Homepage changes saved successfully. Refresh your public website to see them.'
      );
      setMessageType('success');
    }
  }

  if (loading) {
    return (
      <div className="homepage-editor">
        <p className="admin-muted-note">Loading homepage settings…</p>
      </div>
    );
  }

  return (
    <form className="homepage-editor" onSubmit={save}>
      <div className="homepage-editor-intro">
        <span>PUBLIC WEBSITE</span>
        <h2>Homepage content</h2>
        <p>
          Update your main hero message, call-to-action buttons, highlight
          figure, and hero slideshow backgrounds. Changes save directly to your
          website database.
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
        <h3>Main homepage message</h3>

        <label htmlFor="hp-eyebrow">
          Small heading
          <input
            id="hp-eyebrow"
            value={content.eyebrow || ''}
            onChange={(e) => update('eyebrow', e.target.value)}
            placeholder="DIGITAL EXCELLENCE, REDEFINED"
          />
        </label>

        <label htmlFor="hp-headline">
          Main headline *
          <textarea
            id="hp-headline"
            rows="2"
            value={content.headline || ''}
            onChange={(e) => update('headline', e.target.value)}
            required
          />
        </label>

        <label htmlFor="hp-description">
          Supporting description *
          <textarea
            id="hp-description"
            rows="3"
            value={content.description || ''}
            onChange={(e) => update('description', e.target.value)}
            required
          />
        </label>

        <div className="homepage-editor-two">
          <label htmlFor="hp-primary-btn">
            Primary button text
            <input
              id="hp-primary-btn"
              value={content.primaryButton || ''}
              onChange={(e) => update('primaryButton', e.target.value)}
            />
          </label>

          <label htmlFor="hp-secondary-btn">
            Secondary button text
            <input
              id="hp-secondary-btn"
              value={content.secondaryButton || ''}
              onChange={(e) => update('secondaryButton', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="homepage-editor-card">
        <h3>Hero highlight</h3>

        <div className="homepage-editor-two">
          <label htmlFor="hp-highlight-number">
            Highlight number or text
            <input
              id="hp-highlight-number"
              value={content.highlightNumber || ''}
              onChange={(e) => update('highlightNumber', e.target.value)}
            />
          </label>

          <label htmlFor="hp-highlight-label">
            Highlight description
            <input
              id="hp-highlight-label"
              value={content.highlightLabel || ''}
              onChange={(e) => update('highlightLabel', e.target.value)}
            />
          </label>
        </div>

        <p className="homepage-editor-help">
          Only publish project or client totals that you can verify.
        </p>
      </div>

      <div className="homepage-editor-card">
        <h3>Hero background images ({content.slides.length} slides)</h3>

        <p className="homepage-editor-help">
          Upload replacement photographs (JPG, PNG, WebP, GIF, or AVIF up to 5
          MB) or update the caption for each background slide.
        </p>

        {content.slides.map((slide, index) => (
          <div className="homepage-slide-editor" key={index}>
            <div className="homepage-slide-editor-heading">
              <strong>Background {index + 1}</strong>

              {slide.image && (
                <img
                  src={slide.image}
                  alt={`Hero background ${index + 1}`}
                  loading="lazy"
                />
              )}
            </div>

            <label htmlFor={`hp-slide-url-${index}`}>
              Image URL
              <input
                id={`hp-slide-url-${index}`}
                type="url"
                value={slide.image || ''}
                onChange={(e) => updateSlide(index, 'image', e.target.value)}
                placeholder="https://..."
              />
            </label>

            <div className="homepage-editor-two">
              <label htmlFor={`hp-slide-label-${index}`}>
                Image label
                <input
                  id={`hp-slide-label-${index}`}
                  value={slide.label || ''}
                  onChange={(e) => updateSlide(index, 'label', e.target.value)}
                />
              </label>

              <label htmlFor={`hp-slide-caption-${index}`}>
                Short caption
                <input
                  id={`hp-slide-caption-${index}`}
                  value={slide.caption || ''}
                  onChange={(e) =>
                    updateSlide(index, 'caption', e.target.value)
                  }
                />
              </label>
            </div>

            <label className="homepage-upload-button">
              {uploading === index
                ? 'Uploading image…'
                : 'Upload replacement image'}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={uploading !== -1}
                onChange={(e) =>
                  uploadSlide(index, e.target.files?.[0], e.target)
                }
              />
            </label>
          </div>
        ))}
      </div>

      <div className="admin-form-actions">
        <button
          className="homepage-editor-save"
          type="submit"
          disabled={saving || uploading !== -1}
        >
          {saving ? 'Saving homepage…' : 'Save homepage changes'}
        </button>
      </div>
    </form>
  );
}
