import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useScrollReveal } from '../hooks/useScrollReveal';

const STUDIO_CAPABILITIES = [
  'Website Design & Development',
  'Branding & Visual Identity',
  'Graphic Design',
  'Video Editing & Production',
  'SEO & Content Writing',
  'Social Media & Digital Marketing',
  'AI Automation',
];

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [portfolioContent, setPortfolioContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const pageRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadPortfolio() {
      const [contentRes, projectsRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('id', 'portfolio').maybeSingle(),
        supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false }),
      ]);

      if (!mounted) return;
      if (!contentRes.error) setPortfolioContent(contentRes.data?.content || null);
      if (projectsRes.error) {
        setErrorMessage('We could not load portfolio projects right now. Please try again shortly.');
      } else {
        setProjects(projectsRes.data || []);
      }
      setLoading(false);
    }

    loadPortfolio();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedProject(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  const categories = useMemo(() => {
    const found = new Set();
    projects.forEach((project) => {
      const cat = typeof project.category === 'string' ? project.category.trim() : '';
      if (cat) found.add(cat);
    });
    return found.size > 0 ? ['All', ...Array.from(found)] : [];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(
      (project) => (project.category || '').trim() === activeCategory
    );
  }, [projects, activeCategory]);

  useScrollReveal(pageRef, [loading, filteredProjects.length, activeCategory]);

  return (
    <div className="subpage-shell" ref={pageRef}>
      <section className="subpage-hero">
        <div className="subpage-container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Portfolio</span>
          </nav>

          <div className="subpage-hero__grid">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>{portfolioContent?.eyebrow?.trim() || 'OUR CREATIVE WORK'}</span>
              </div>

              <h1>
                {portfolioContent?.heading?.trim() || 'Ideas brought to life.'}
              </h1>

              <p className="subpage-hero__lead">
                {portfolioContent?.intro?.trim() ||
                  'Explore published work from Syncra Digital Agency. Every project is crafted around clear strategy, refined visual design, and reliable performance.'}
              </p>
            </div>

            <div className="subpage-hero__aside">
              <div className="subpage-meta-card">
                <span>STUDIO ARCHIVE</span>
                <strong>
                  {String(projects.length).padStart(2, '0')} Published{' '}
                  {projects.length === 1 ? 'Project' : 'Projects'}
                </strong>
                <p>
                  Only genuine completed and published client projects appear in
                  our showcase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          {categories.length > 0 && (
            <div className="portfolio-filter-bar reveal">
              <div className="filter-pills" role="group" aria-label="Filter projects by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-pill ${activeCategory === category ? 'is-active' : ''}`}
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <span className="faq-count-note">
                Showing {filteredProjects.length} of {projects.length}
              </span>
            </div>
          )}

          {loading ? (
            <div className="home-state-note" role="status">
              Loading portfolio projects...
            </div>
          ) : errorMessage ? (
            <div className="home-portfolio-empty" role="alert">
              <h3>Unable to load portfolio</h3>
              <p>{errorMessage}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="home-portfolio-empty reveal">
              <div className="home-portfolio-empty__mark" aria-hidden="true">
                S.
              </div>
              <span className="home-portfolio-empty__eyebrow">
                {portfolioContent?.emptyLabel?.trim() || 'CURATED SHOWCASE'}
              </span>
              <h3>
                {portfolioContent?.emptyTitle?.trim() ||
                  'Our next flagship project could be yours.'}
              </h3>
              <p>
                We publish verified work directly through our studio archive—we
                never fill our portfolio with fabricated case studies or mockup
                brands. Reach out to discuss what we can build together.
              </p>

              <div className="portfolio-capabilities-strip" aria-label="Capabilities">
                {STUDIO_CAPABILITIES.map((cap) => (
                  <span key={cap}>{cap}</span>
                ))}
              </div>

              <div className="home-portfolio-empty__actions">
                <Link to="/contact" className="btn-cyan-pill">
                  <span>Start Your Project</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link to="/faq" className="btn-ghost-pill">
                  Read Project FAQs
                </Link>
              </div>
            </div>
          ) : (
            <div className="portfolio-project-grid">
              {filteredProjects.map((project, index) => {
                const isFeatured = Boolean(project.featured ?? project.is_featured);
                return (
                  <article
                    className={`public-project-card portfolio-project-card reveal ${
                      isFeatured ? 'is-featured' : ''
                    }`}
                    key={project.id}
                    style={{ '--reveal-delay': `${(index % 2) * 90}ms` }}
                  >
                    <div className="portfolio-project-visual">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="portfolio-project-no-image">
                          <span>S.</span>
                        </div>
                      )}
                      <span className="portfolio-project-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {isFeatured && (
                        <span className="portfolio-featured-tag">FEATURED WORK</span>
                      )}
                      {project.project_url && (
                        <a
                          className="portfolio-open-link"
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.title} live website`}
                        >
                          ↗
                        </a>
                      )}
                    </div>

                    <div className="public-project-info portfolio-project-info">
                      <div className="portfolio-project-meta">
                        <span>{project.category || 'CREATIVE PROJECT'}</span>
                        <span>SYNCRA WORK</span>
                      </div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>

                      <div className="portfolio-card-actions">
                        <button
                          type="button"
                          className="portfolio-detail-trigger"
                          onClick={() => setSelectedProject(project)}
                        >
                          Project details
                        </button>

                        {project.project_url && (
                          <a
                            className="portfolio-text-link"
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View live site <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="home-inline-cta reveal">
            <div>
              <span className="home-inline-cta__eyebrow">HAVE A PROJECT IN MIND?</span>
              <p>
                Let&apos;s build a website, brand identity, or digital campaign
                tailored to your business.
              </p>
            </div>
            <Link to="/contact" className="btn-cyan-pill">
              <span>Start a Conversation</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {selectedProject && (
        <div
          className="project-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedProject(null);
          }}
        >
          <div className="project-modal">
            <button
              type="button"
              className="project-modal__close"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              ×
            </button>

            {selectedProject.cover_image_url && (
              <div className="project-modal__media">
                <img
                  src={selectedProject.cover_image_url}
                  alt={selectedProject.title}
                />
              </div>
            )}

            <div className="project-modal__body">
              <div className="project-modal__meta">
                <span className="project-modal__category">
                  {selectedProject.category || 'CREATIVE PROJECT'}
                </span>
                {Boolean(selectedProject.featured ?? selectedProject.is_featured) && (
                  <span className="article-category-pill">Featured Work</span>
                )}
              </div>

              <h2 id="project-modal-title">{selectedProject.title}</h2>
              <p>
                {selectedProject.description ||
                  'Project details are available upon request.'}
              </p>

              <div className="project-modal__actions">
                {selectedProject.project_url && (
                  <a
                    href={selectedProject.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cyan-pill"
                  >
                    <span>Visit Live Project</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
                <Link
                  to="/contact"
                  className="btn-ghost-pill"
                  onClick={() => setSelectedProject(null)}
                >
                  Request a Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
