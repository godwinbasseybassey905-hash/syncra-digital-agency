import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ContactActionButtons from '../components/ContactActionButtons';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../data/faqData';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(() => new Set([FAQ_ITEMS[0].id]));
  const pageRef = useRef(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Topics' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      return (
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [selectedCategory, normalizedQuery]);

  const groupedItems = useMemo(() => {
    const groups = new Map();
    filteredItems.forEach((item) => {
      if (!groups.has(item.category)) {
        groups.set(item.category, []);
      }
      groups.get(item.category).push(item);
    });
    return Array.from(groups.entries());
  }, [filteredItems]);

  useScrollReveal(pageRef, [selectedCategory, normalizedQuery]);

  function toggleItem(id) {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenIds(new Set(filteredItems.map((item) => item.id)));
  }

  function collapseAll() {
    setOpenIds(new Set());
  }

  return (
    <div className="subpage-shell" ref={pageRef}>
      <section className="subpage-hero">
        <div className="subpage-container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">FAQ</span>
          </nav>

          <div className="subpage-hero__grid">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>

              <h1>
                Clear, honest answers <span>before we begin.</span>
              </h1>

              <p className="subpage-hero__lead">
                Browse common questions about Syncra&apos;s services, web design
                approach, collaboration workflow, timelines, and support.
                Project-specific details are always discussed transparently
                during consultation.
              </p>
            </div>

            <div className="subpage-hero__aside">
              <div className="subpage-meta-card">
                <span>HAVE A SPECIFIC QUESTION?</span>
                <strong>Ask our team directly</strong>
                <p>
                  Reach our team directly via email, WhatsApp, or phone.
                </p>
                <ContactActionButtons size="sm" className="faq-hero-contact-actions" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="faq-controls reveal">
            <div className="faq-search-row">
              <div className="faq-search-box">
                <label htmlFor="faq-search-input" className="skip-link">
                  Search frequently asked questions
                </label>
                <input
                  id="faq-search-input"
                  type="search"
                  placeholder="Search questions (e.g. website, SEO, timeline, pricing)..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="faq-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear FAQ search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="faq-bulk-actions">
                <span className="faq-count-note">
                  {filteredItems.length}{' '}
                  {filteredItems.length === 1 ? 'question' : 'questions'}
                </span>
                <button
                  type="button"
                  className="faq-bulk-btn"
                  onClick={expandAll}
                >
                  Expand all
                </button>
                <button
                  type="button"
                  className="faq-bulk-btn"
                  onClick={collapseAll}
                >
                  Collapse all
                </button>
              </div>
            </div>

            <div
              className="filter-pills"
              role="group"
              aria-label="Filter FAQ by category"
            >
              {FAQ_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-pill ${
                    selectedCategory === category ? 'is-active' : ''
                  }`}
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {groupedItems.length === 0 ? (
            <div className="faq-empty-box">
              <h3>No matching questions found</h3>
              <p>
                Try another keyword or reset your filters—or reach out directly
                and we will be glad to answer your question.
              </p>
              <button
                type="button"
                className="btn-ghost-pill"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Topics');
                }}
              >
                Reset search &amp; filters
              </button>
            </div>
          ) : (
            groupedItems.map(([category, items]) => (
              <div className="faq-group" key={category}>
                <h2 className="faq-group__title">{category}</h2>
                <div className="faq-list">
                  {items.map((item) => {
                    const isOpen = openIds.has(item.id);
                    return (
                      <div
                        className={`faq-item ${isOpen ? 'is-open' : ''}`}
                        key={item.id}
                      >
                        <button
                          type="button"
                          className="faq-item__trigger"
                          onClick={() => toggleItem(item.id)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${item.id}`}
                          id={`faq-trigger-${item.id}`}
                        >
                          <span>{item.question}</span>
                          <span className="faq-item__icon" aria-hidden="true">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>

                        <div
                          id={`faq-panel-${item.id}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${item.id}`}
                          className="faq-item__body"
                          hidden={!isOpen}
                        >
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          <div className="home-inline-cta reveal">
            <div>
              <span className="home-inline-cta__eyebrow">STILL HAVE A QUESTION?</span>
              <p>
                Tell us what you are planning and our team will gladly walk you
                through the best approach for your business.
              </p>
            </div>
            <Link to="/contact" className="btn-cyan-pill">
              <span>Contact Syncra</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
