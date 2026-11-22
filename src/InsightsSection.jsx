import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function InsightsSection({ standalone = false, limit = null }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, created_at')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (typeof limit === 'number' && limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (!mounted) return;

      if (error) {
        console.error('Could not load articles:', error.message);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, [limit]);

  useScrollReveal(sectionRef, [loading, posts.length, standalone]);

  const HeadingTag = standalone ? 'h1' : 'h2';

  return (
    <section
      ref={sectionRef}
      className={`home-band home-insights ${
        standalone ? 'home-insights--standalone' : ''
      }`}
      id="insights"
    >
      <div className="home-container">
        <div className="home-insights__top reveal">
          <div className="pill-eyebrow">
            <span className="pill-eyebrow__dot" aria-hidden="true" />
            <span>INSIGHTS &amp; PERSPECTIVES</span>
          </div>

          {!standalone && (
            <Link to="/insights" className="btn-text-link">
              View All Insights <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        <div className="home-section-header reveal">
          <HeadingTag className="home-section-title">
            Ideas that <span>move your brand forward.</span>
          </HeadingTag>

          <p className="home-section-subtitle">
            Practical notes on web design, branding, SEO, content strategy, and
            digital execution from the Syncra team.
          </p>
        </div>

        {loading ? (
          <div className="home-state-note" role="status">
            Loading latest articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="home-insights-empty reveal">
            <span>SYNCRA EDITORIAL</span>
            <h3>New articles are on the way.</h3>
            <p>
              Our latest insights on web design, digital strategy, and brand
              growth will appear here as soon as they are published.
            </p>
            {!standalone ? (
              <Link to="/insights" className="btn-ghost-pill">
                <span>Visit Insights Page</span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link to="/contact" className="btn-cyan-pill">
                <span>Start a Conversation</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="home-insights__grid">
            {posts.map((post, index) => (
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
                  <time
                    className="home-insight-card__date"
                    dateTime={post.published_at || post.created_at || undefined}
                  >
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Syncra Insights'}
                  </time>

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
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
