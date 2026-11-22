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
  description: '',
  category: '',
  project_url: '',
  cover_image_url: '',
  featured: false,
  published: false,
};

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const imagePreview = useMemo(
    () => (image ? URL.createObjectURL(image) : form.cover_image_url),
    [image, form.cover_image_url]
  );

  useEffect(() => {
    return () => {
      if (image && imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [image, imagePreview]);

  function notify(text, type = 'info') {
    setMessage(text);
    setMessageType(type);
  }

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) notify(`Could not load projects: ${error.message}`, 'error');
    else setProjects(data || []);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        setMessage(`Could not load projects: ${error.message}`);
        setMessageType('error');
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleImageSelect(file) {
    if (!file) {
      setImage(null);
      return;
    }
    const validation = validateImageFile(file);
    if (!validation.valid) {
      notify(validation.error, 'error');
      const input = document.getElementById('project-cover-image');
      if (input) input.value = '';
      return;
    }
    setImage(file);
    notify(`Image ready (${formatFileSize(file.size)}). Save project to upload.`, 'info');
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImage(null);
    const input = document.getElementById('project-cover-image');
    if (input) input.value = '';
  }

  function startEditing(project) {
    setEditingId(project.id);
    setForm({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      category: project.category || '',
      project_url: project.project_url || '',
      cover_image_url: project.cover_image_url || '',
      featured: Boolean(project.featured),
      published: Boolean(project.published),
    });
    setImage(null);
    notify('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      notify('Please enter a project title.', 'error');
      return;
    }

    setSaving(true);
    notify(image ? 'Uploading cover image & saving project…' : 'Saving project…');
    try {
      let imageUrl = form.cover_image_url || null;
      if (image) {
        const uploaded = await uploadToProjectImages({
          file: image,
          folder: 'portfolio',
          upsert: false,
        });
        imageUrl = uploaded.publicUrl;
      }

      const projectData = {
        title: form.title.trim(),
        slug: makeSlug(form.slug.trim() || form.title),
        description: form.description.trim(),
        category: form.category.trim(),
        project_url: form.project_url.trim() || null,
        cover_image_url: imageUrl,
        featured: form.featured,
        published: form.published,
      };

      const result = editingId
        ? await supabase.from('projects').update(projectData).eq('id', editingId)
        : await supabase.from('projects').insert(projectData);

      if (result.error) throw result.error;
      notify(
        editingId ? 'Project updated successfully.' : 'Project added successfully.',
        'success'
      );
      resetForm();
      await loadProjects();
    } catch (error) {
      notify(`Could not save project: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(project) {
    setTogglingId(project.id);
    const nextPublished = !project.published;
    const { error } = await supabase
      .from('projects')
      .update({ published: nextPublished })
      .eq('id', project.id);
    setTogglingId(null);

    if (error) {
      notify(`Could not update project status: ${error.message}`, 'error');
      return;
    }

    notify(
      nextPublished ? `"${project.title}" published.` : `"${project.title}" moved to drafts.`,
      'success'
    );
    await loadProjects();
  }

  async function deleteProject(project) {
    if (
      !window.confirm(
        `Delete "${project.title}"? This removes the project record from your portfolio.`
      )
    ) {
      return;
    }
    setDeletingId(project.id);
    const { error } = await supabase.from('projects').delete().eq('id', project.id);

    if (error) notify(`Could not delete project: ${error.message}`, 'error');
    else {
      if (editingId === project.id) resetForm();
      notify('Project deleted successfully.', 'success');
      await loadProjects();
    }
    setDeletingId(null);
  }

  const publishedCount = projects.filter((project) => project.published).length;
  const featuredCount = projects.filter((project) => project.featured).length;

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      if (statusFilter === 'published' && !project.published) return false;
      if (statusFilter === 'draft' && project.published) return false;
      if (statusFilter === 'featured' && !project.featured) return false;
      if (!q) return true;
      return (
        (project.title || '').toLowerCase().includes(q) ||
        (project.category || '').toLowerCase().includes(q) ||
        (project.description || '').toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery, statusFilter]);

  return (
    <section className="projects-manager">
      <div className="portfolio-manager-heading">
        <div>
          <span className="portfolio-manager-eyebrow">WEBSITE CONTENT</span>
          <h2>Portfolio Projects</h2>
          <p>Manage the projects displayed on the homepage and dedicated Portfolio page.</p>
        </div>
        <div className="portfolio-manager-count">
          <strong>{projects.length}</strong>
          <span>Total projects</span>
        </div>
      </div>

      <div className="portfolio-manager-stats">
        <div>
          <strong>{publishedCount}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>{featuredCount}</strong>
          <span>Featured</span>
        </div>
        <div>
          <strong>{projects.length - publishedCount}</strong>
          <span>Drafts</span>
        </div>
      </div>

      {message && (
        <p
          className={`portfolio-manager-message is-${messageType}`}
          role={messageType === 'error' ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="project-form portfolio-project-form">
        <div className="portfolio-form-heading">
          <div>
            <span className="portfolio-form-step">
              {editingId ? 'EDIT PROJECT' : 'NEW PORTFOLIO ENTRY'}
            </span>
            <h3>{editingId ? 'Update project details' : 'Add a project to your portfolio'}</h3>
          </div>
          {editingId && (
            <button
              className="portfolio-quiet-button"
              type="button"
              onClick={resetForm}
            >
              Cancel editing
            </button>
          )}
        </div>

        <div className="portfolio-form-grid">
          <label htmlFor="project-title">
            Project title *
            <input
              id="project-title"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Brand website redesign"
              required
            />
          </label>
          <label htmlFor="project-slug">
            URL slug
            <input
              id="project-slug"
              name="slug"
              value={form.slug}
              onChange={updateField}
              placeholder="Generated automatically if left blank"
            />
          </label>
          <label htmlFor="project-category">
            Category
            <input
              id="project-category"
              name="category"
              value={form.category}
              onChange={updateField}
              placeholder="e.g. Website Design"
            />
          </label>
          <label htmlFor="project-url">
            Project website URL
            <input
              id="project-url"
              name="project_url"
              type="url"
              value={form.project_url}
              onChange={updateField}
              placeholder="https://example.com"
            />
          </label>
        </div>

        <label htmlFor="project-description">
          Project description
          <textarea
            id="project-description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows="4"
            placeholder="Briefly explain the work completed and its value."
          />
        </label>

        <div className="portfolio-image-field">
          <label htmlFor="project-cover-image">Project cover image</label>
          <input
            id="project-cover-image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={saving}
            onChange={(event) => handleImageSelect(event.target.files?.[0] || null)}
          />
          <span className="portfolio-field-hint">
            Recommended: landscape JPG, PNG, or WebP up to 5 MB. Stored in project-images/portfolio.
          </span>
          {imagePreview && (
            <div className="portfolio-image-preview">
              <img src={imagePreview} alt="Project cover preview" />
              <div>
                <strong>
                  {image ? `${image.name} (${formatFileSize(image.size)})` : 'Current cover image'}
                </strong>
                <span>
                  {image
                    ? 'New image validated — it uploads when you save.'
                    : 'This image is currently saved.'}
                </span>
                {image && (
                  <button
                    type="button"
                    className="portfolio-quiet-button"
                    onClick={() => {
                      setImage(null);
                      const input = document.getElementById('project-cover-image');
                      if (input) input.value = '';
                    }}
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="portfolio-publish-options">
          <label className="portfolio-toggle">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={updateField}
            />
            <span>
              <strong>Featured project</strong>
              <small>Highlight this project with a Featured badge.</small>
            </span>
          </label>
          <label className="portfolio-toggle">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={updateField}
            />
            <span>
              <strong>Publish on website</strong>
              <small>Make this project visible to website visitors.</small>
            </span>
          </label>
        </div>

        <div className="portfolio-form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? 'Saving project…'
              : editingId
                ? 'Save project changes'
                : 'Add project'}
          </button>
          {!editingId && (
            <button
              type="button"
              className="portfolio-quiet-button"
              onClick={resetForm}
              disabled={saving}
            >
              Clear form
            </button>
          )}
        </div>
      </form>

      <div className="portfolio-existing-heading">
        <div>
          <span className="portfolio-form-step">YOUR WORK</span>
          <h3>Existing projects</h3>
        </div>
        <span>
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {projects.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <label htmlFor="projects-search" className="skip-link">
              Search projects
            </label>
            <input
              id="projects-search"
              type="search"
              placeholder="Search projects by title or category..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="admin-toolbar-filters" role="group" aria-label="Filter projects">
            {[
              { value: 'all', label: 'All' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Drafts' },
              { value: 'featured', label: 'Featured' },
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
        <p className="admin-muted-note">Loading portfolio projects…</p>
      ) : projects.length === 0 ? (
        <div className="portfolio-empty-state">
          <span className="portfolio-empty-mark">S.</span>
          <h4>Your portfolio is ready for its first project.</h4>
          <p>Add a project above, then publish it when you are ready for visitors to see it.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="admin-empty-card">
          <p>No projects match your current search or filter.</p>
        </div>
      ) : (
        <div className="projects-list portfolio-admin-grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className="project-admin-card portfolio-admin-card">
              <div className="portfolio-admin-image">
                {project.cover_image_url ? (
                  <img src={project.cover_image_url} alt={`${project.title} cover`} />
                ) : (
                  <div className="portfolio-admin-no-image">
                    SYNC<span>RA</span>
                  </div>
                )}
                {project.featured && <span className="portfolio-featured-tag">FEATURED</span>}
              </div>
              <div className="portfolio-admin-card-content">
                <div className="portfolio-admin-card-meta">
                  <span>{project.category || 'Uncategorised'}</span>
                  <span className={project.published ? 'is-published' : 'is-draft'}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h4>{project.title}</h4>
                <p>{project.description || 'No project description added yet.'}</p>
                <div className="portfolio-admin-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => startEditing(project)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn-success"
                    disabled={togglingId === project.id}
                    onClick={() => togglePublish(project)}
                  >
                    {togglingId === project.id
                      ? 'Updating…'
                      : project.published
                        ? 'Unpublish'
                        : 'Publish'}
                  </button>
                  <button
                    type="button"
                    className="portfolio-delete-button"
                    disabled={deletingId === project.id}
                    onClick={() => deleteProject(project)}
                  >
                    {deletingId === project.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
