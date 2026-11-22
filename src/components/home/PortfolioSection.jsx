import { Link } from 'react-router-dom';

export default function PortfolioSection({
  projects = [],
  portfolioContent,
  loading,
}) {
  const selectedProjects = projects.slice(0, 6);

  return (
    <section className="home-band home-portfolio" id="projects">
      <div className="home-container">
        <div className="home-portfolio__topline reveal">
          <div className="pill-eyebrow">
            <span className="pill-eyebrow__dot" aria-hidden="true" />
            <span>{portfolioContent?.eyebrow?.trim() || 'SELECTED PORTFOLIO'}</span>
          </div>

          <div className="home-portfolio__meta-right">
            <span className="portfolio-count">
              {String(projects.length).padStart(2, '0')} <i>PUBLISHED PROJECTS</i>
            </span>
            <Link to="/portfolio" className="btn-text-link">
              View Full Portfolio <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="home-section-header reveal">
          <h2 className="home-section-title">
            {portfolioContent?.heading?.trim() || 'Ideas brought to life.'}
          </h2>
          <p className="home-section-subtitle">
            {portfolioContent?.intro?.trim() ||
              'Explore selected work from our creative portfolio. Each project reflects a deliberate balance of clarity, design craft, and technical execution.'}
          </p>
        </div>

        {loading ? (
          <div className="home-state-note" role="status">
            Loading selected projects...
          </div>
        ) : selectedProjects.length === 0 ? (
          <div className="home-portfolio-empty reveal">
            <div className="home-portfolio-empty__mark" aria-hidden="true">
              S.
            </div>
            <span className="home-portfolio-empty__eyebrow">
              {portfolioContent?.emptyLabel?.trim() || 'PORTFOLIO SHOWCASE'}
            </span>
            <h3>
              {portfolioContent?.emptyTitle?.trim() ||
                'Our next flagship project could be yours.'}
            </h3>
            <p>
              Published client work managed through our studio showcase will
              appear here. Ready to build something worth showcasing?
            </p>
            <div className="home-portfolio-empty__actions">
              <a href="#contact" className="btn-cyan-pill">
                <span>Start a Project</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <Link to="/portfolio" className="btn-ghost-pill">
                Visit Portfolio Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="portfolio-project-grid">
            {selectedProjects.map((project, index) => {
              const isFeatured = Boolean(project.featured ?? project.is_featured);
              return (
                <article
                  className={`public-project-card portfolio-project-card reveal ${
                    isFeatured ? 'is-featured' : ''
                  }`}
                  key={project.id}
                  style={{ '--reveal-delay': `${(index % 2) * 110}ms` }}
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
                      <span className="portfolio-featured-tag">FEATURED</span>
                    )}
                    {project.project_url && (
                      <a
                        className="portfolio-open-link"
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live`}
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
                    {project.project_url && (
                      <a
                        className="portfolio-text-link"
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View live project <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="home-inline-cta reveal">
          <div>
            <span className="home-inline-cta__eyebrow">HAVE A PROJECT IN MIND?</span>
            <p>Let&apos;s design and build a digital experience tailored to your brand.</p>
          </div>
          <a href="#contact" className="btn-cyan-pill">
            <span>Start Your Project</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
