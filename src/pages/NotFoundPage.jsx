import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="not-found-section" aria-labelledby="not-found-heading">
      <div className="not-found-card">
        <span className="not-found-code" aria-hidden="true">
          404
        </span>

        <div className="pill-eyebrow">
          <span className="pill-eyebrow__dot" aria-hidden="true" />
          <span>PAGE NOT FOUND</span>
        </div>

        <h1 id="not-found-heading">This page isn&apos;t here.</h1>

        <p>
          The page you tried to open doesn&apos;t exist or may have moved. Use
          the links below to head back to the Syncra homepage or explore what
          you need.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-cyan-pill">
            <span>Return to Homepage</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <Link to="/portfolio" className="btn-ghost-pill">
            Explore Portfolio
          </Link>
          <Link to="/#services" className="btn-ghost-pill">
            View Services
          </Link>
        </div>

        <nav className="not-found-links" aria-label="Helpful links">
          <Link to="/about">About Syncra</Link>
          <Link to="/faq">Frequently Asked Questions</Link>
          <Link to="/insights">Insights &amp; Articles</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
      </div>
    </section>
  );
}
