import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useScrollReveal } from '../hooks/useScrollReveal';

const EDITORIAL_TOPICS = [
  'Website Design & UX',
  'SEO & Online Visibility',
  'Brand Identity',
  'Content & Video Strategy',
  'Digital Growth & Automation',
];

function estimateReadMinutes(text) {
  if (!text || typeof text !== 'string') return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return null;
  return Math.max(1, Math.ceil(words / 220));
}

export default function InsightsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const pageRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        setErrorMessage('We could not load published articles right now. Please try again shortly.');
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }

    loadPosts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const found = new Set();
    posts.forEach((post) => {
      if (typeof post.category === 'string' && post.category.trim()) {
        found.add(post.category.trim());
      }
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (typeof tag === 'string' && tag.trim()) found.add(tag.trim());
        });
      }
    });
    return found.size > 0 ? ['All', ...Array.from(found)] : [];
  }, [posts]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat =
        activeCategory === 'All' ||
        (post.category || '').trim() === activeCategory ||
        (Array.isArray(post.tags) && post.tags.includes(activeCategory));

      if (!matchesCat) return false;
      if (!normalizedQuery) return true;

      return (
        (post.title || '').toLowerCase().includes(normalizedQuery) ||
        (post.excerpt || '').toLowerCase().includes(normalizedQuery)
      );
    });
  }, [posts, activeCategory, normalizedQuery]);

  const showLeadPost =
    !normalizedQuery && activeCategory === 'All' && filteredPosts.length > 1;
  const leadPost = showLeadPost ? filteredPosts[0] : null;
  const gridPosts = showLeadPost ? filteredPosts.slice(1) : filteredPosts;

  useScrollReveal(pageRef, [loading, filteredPosts.length, activeCategory, normalizedQuery]);

  return (
    <div className="subpage-shell" ref={pageRef}>
      <section className="subpage-hero">
        <div className="subpage-container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Insights</span>
          </nav>

          <div className="subpage-hero__grid">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>SYNCRA INSIGHTS &amp; EDITORIAL</span>
              </div>

              <h1>
                Practical ideas on <span>design, web &amp; digital growth.</span>
              </h1>

              <p className="subpage-hero__lead">
                Thoughtful articles, practical guides, and perspectives from
                Syncra Digital Agency to help businesses make sharper decisions
                about their websites, branding, content, and online strategy.
              </p>
            </div>

            <div className="subpage-hero__aside">
              <div className="subpage-meta-card">
                <span>PUBLISHED ARCHIVE</span>
                <strong>
                  {String(posts.length).padStart(2, '0')} Published{' '}
                  {posts.length === 1 ? 'Article' : 'Articles'}
                </strong>
                <p>
                  Every article here is published directly by the Syncra team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          {posts.length > 0 && (
            <div className="insights-toolbar reveal">
              <div className="faq-search-box">
                <label htmlFor="insights-search" className="skip-link">
                  Search published articles
                </label>
                <input
                  id="insights-search"
                  type="search"
                  placeholder="Search articles by title or topic..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="faq-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear article search"
                  >
                    ×
                  </button>
                )}
              </div>

              {categories.length > 0 && (
                <div className="filter-pills" role="group" aria-label="Filter articles">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-pill ${activeCategory === cat ? 'is-active' : ''}`}
                      aria-pressed={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="home-state-note" role="status">
              Loading published insights...
            </div>
          ) : errorMessage ? (
            <div className="home-insights-empty" role="alert">
              <h3>Unable to load articles</h3>
              <p>{errorMessage}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="home-insights-empty reveal">
              <span>SYNCRA EDITORIAL</span>
              <h3>Our editorial archive is getting ready.</h3>
              <p>
                No articles have been published yet. As soon as our team
                publishes new guides and perspectives, they will appear right
                here.
              </p>

              <div className="insights-topics-strip" aria-label="Upcoming editorial topics">
                {EDITORIAL_TOPICS.map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>

              <div className="home-portfolio-empty__actions">
                <Link to="/contact" className="btn-cyan-pill">
                  <span>Discuss Your Project</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link to="/faq" className="btn-ghost-pill">
                  Browse FAQs
                </Link>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="faq-empty-box">
              <h3>No articles match your search</h3>
              <p>Try a different keyword or view all published insights.</p>
              <button
                type="button"
                className="btn-ghost-pill"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                Reset search
              </button>
            </div>
          ) : (
            <>
              {leadPost && (
                <article className="insights-featured-card reveal">
                  <Link
                    to={`/insights/${encodeURIComponent(leadPost.slug)}`}
                    className="insights-featured-card__media"
                    aria-label={leadPost.title}
                  >
                    {leadPost.cover_image_url ? (
                      <img src={leadPost.cover_image_url} alt={leadPost.title} />
                    ) : (
                      <div className="home-insight-card__placeholder">
                        <span>SYNCRA INSIGHTS</span>
                      </div>
                    )}
                  </Link>

                  <div className="insights-featured-card__body">
                    <div className="article-meta-row" style={{ marginTop: 0 }}>
                      {leadPost.category && (
                        <span className="article-category-pill">{leadPost.category}</span>
                      )}
                      {leadPost.published_at && (
                        <time dateTime={leadPost.published_at}>
                          {new Date(leadPost.published_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                      {estimateReadMinutes(leadPost.content) && (
                        <span>{estimateReadMinutes(leadPost.content)} min read</span>
                      )}
                    </div>

                    <h2>
                      <Link to={`/insights/${encodeURIComponent(leadPost.slug)}`}>
                        {leadPost.title}
                      </Link>
                    </h2>

                    {leadPost.excerpt && <p>{leadPost.excerpt}</p>}

                    <Link
                      to={`/insights/${encodeURIComponent(leadPost.slug)}`}
                      className="btn-cyan-pill"
                      style={{ width: 'fit-content' }}
                    >
                      <span>Read Featured Article</span>
                      <span className="btn-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              )}

              <div className="home-insights__grid">
                {gridPosts.map((post, index) => {
                  const readMins = estimateReadMinutes(post.content);
                  return (
                    <article
                      key={post.id}
                      className="home-insight-card reveal"
                      style={{ '--reveal-delay': `${(index % 3) * 80}ms` }}
                    >
                      <Link
                        to={`/insights/${encodeURIComponent(post.slug)}`}
                        className="home-insight-card__media"
                        aria-label={post.title}
                      >
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            loading="lazy"
                          />
                        ) : (
                          <div className="home-insight-card__placeholder">
                            <span>SYNCRA</span>
                          </div>
                        )}
                      </Link>

                      <div className="home-insight-card__body">
                        <div className="home-insight-card__date">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Syncra Insights'}
                          {readMins ? ` · ${readMins} min read` : ''}
                        </div>

                        <h3>
                          <Link to={`/insights/${encodeURIComponent(post.slug)}`}>
                            {post.title}
                          </Link>
                        </h3>

                        {post.excerpt && <p>{post.excerpt}</p>}

                        <Link
                          to={`/insights/${encodeURIComponent(post.slug)}`}
                          className="home-insight-card__link"
                        >
                          Read Article <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="home-inline-cta reveal">
            <div>
              <span className="home-inline-cta__eyebrow">NEED A PARTNER FOR YOUR DIGITAL PRESENCE?</span>
              <p>
                Talk to Syncra Digital Agency about your website, branding,
                content, or digital growth strategy.
              </p>
            </div>
            <Link to="/contact" className="btn-cyan-pill">
              <span>Contact Us</span>
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
