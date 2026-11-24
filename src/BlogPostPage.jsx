import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

function parseArticleBlocks(content) {
  if (!content || typeof content !== 'string') return [];

  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('### ')) {
        return { key: `h3-${index}`, type: 'h3', text: block.slice(4).trim() };
      }
      if (block.startsWith('## ')) {
        return { key: `h2-${index}`, type: 'h2', text: block.slice(3).trim() };
      }
      return { key: `p-${index}`, type: 'p', text: block };
    });
}

export default function BlogPostPage({ slug }) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchPostAndRelated() {
      if (!slug) {
        if (mounted) {
          setErrorState('not_found');
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setErrorState('error');
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorState('not_found');
        setLoading(false);
        return;
      }

      setPost(data);
      setErrorState('');
      setLoading(false);

      const { data: others, error: relError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at')
        .eq('published', true)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(2);

      if (mounted && !relError) {
        setRelatedPosts(others || []);
      }
    }

    fetchPostAndRelated();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (post?.title) {
      const fullTitle = `${post.title} | Syncra Digital Agency`;
      const desc =
        post.excerpt ||
        'Thoughtful perspectives, practical guides, and ideas from Syncra Digital Agency.';
      const canonicalUrl = `https://syncra-digital-agency.vercel.app/insights/${encodeURIComponent(
        post.slug || slug
      )}`;

      document.title = fullTitle;

      const updateMetaTag = (attribute, name, content) => {
        let el = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attribute, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      const updateLinkTag = (rel, href) => {
        let el = document.querySelector(`link[rel="${rel}"]`);
        if (!el) {
          el = document.createElement('link');
          el.setAttribute(rel, rel);
          document.head.appendChild(el);
        }
        el.setAttribute('href', href);
      };

      updateMetaTag('name', 'description', desc);
      updateMetaTag('name', 'robots', 'index, follow');
      updateLinkTag('canonical', canonicalUrl);
      updateMetaTag('property', 'og:title', fullTitle);
      updateMetaTag('property', 'og:description', desc);
      updateMetaTag('property', 'og:url', canonicalUrl);
      updateMetaTag('property', 'og:type', 'article');
      updateMetaTag('name', 'twitter:title', fullTitle);
      updateMetaTag('name', 'twitter:description', desc);
      updateMetaTag('name', 'twitter:url', canonicalUrl);
    }
  }, [post, slug]);

  useEffect(() => {
    if (!post) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, scrollTop / docHeight)));
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, [post]);

  const blocks = useMemo(() => parseArticleBlocks(post?.content), [post?.content]);

  const readMinutes = useMemo(() => {
    if (!post?.content) return null;
    const words = post.content.trim().split(/\s+/).filter(Boolean).length;
    return words ? Math.max(1, Math.ceil(words / 220)) : null;
  }, [post]);

  if (loading) {
    return (
      <div className="blog-post-state" role="status" aria-live="polite">
        <div className="loading-orb" aria-hidden="true" />
        <p>Loading article...</p>
      </div>
    );
  }

  if (errorState === 'error') {
    return (
      <div className="blog-post-state" role="alert">
        <div className="pill-eyebrow">
          <span className="pill-eyebrow__dot" aria-hidden="true" />
          <span>CONNECTION ERROR</span>
        </div>
        <h1>Unable to load article</h1>
        <p>
          We encountered an issue retrieving this article. Please refresh the
          page or return to the Insights archive.
        </p>
        <Link to="/insights" className="btn-cyan-pill">
          ← Back to Insights
        </Link>
      </div>
    );
  }

  if (errorState === 'not_found' || !post) {
    return (
      <div className="blog-post-state">
        <div className="pill-eyebrow">
          <span className="pill-eyebrow__dot" aria-hidden="true" />
          <span>ARTICLE NOT FOUND</span>
        </div>
        <h1>We couldn&apos;t find that article.</h1>
        <p>
          The article may have been moved, unpublished, or the link may be
          incorrect.
        </p>
        <div className="not-found-actions">
          <Link to="/insights" className="btn-cyan-pill">
            ← Back to Insights
          </Link>
          <Link to="/" className="btn-ghost-pill">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    (typeof post.author_name === 'string' && post.author_name.trim()) ||
    (typeof post.author === 'string' && post.author.trim()) ||
    '';
  const categoryLabel =
    (typeof post.category === 'string' && post.category.trim()) || '';

  return (
    <>
      <div className="reading-progress-track" aria-hidden="true">
        <div
          className="reading-progress-bar"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <article className="article-page">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/insights">Insights</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Article</span>
        </nav>

        <header className="article-header">
          <div className="pill-eyebrow">
            <span className="pill-eyebrow__dot" aria-hidden="true" />
            <span>SYNCRA INSIGHTS</span>
          </div>

          <h1 className="blog-post-title">{post.title}</h1>

          <div className="article-meta-row">
            {categoryLabel && (
              <span className="article-category-pill">{categoryLabel}</span>
            )}
            {authorName && <span>By {authorName}</span>}
            {post.published_at && (
              <time dateTime={post.published_at}>
                Published{' '}
                {new Date(post.published_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {readMinutes && <span>{readMinutes} min read</span>}
          </div>
        </header>

        {post.cover_image_url && (
          <img
            className="blog-post-cover"
            src={post.cover_image_url}
            alt={post.title}
          />
        )}

        {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}

        <div className="article-prose">
          {blocks.map((block) => {
            if (block.type === 'h2') return <h2 key={block.key}>{block.text}</h2>;
            if (block.type === 'h3') return <h3 key={block.key}>{block.text}</h3>;
            return <p key={block.key}>{block.text}</p>;
          })}
        </div>

        <section className="article-cta-banner" aria-label="Start a project">
          <div className="pill-eyebrow">
            <span className="pill-eyebrow__dot" aria-hidden="true" />
            <span>WORK WITH SYNCRA</span>
          </div>
          <h2>Ready to elevate your digital presence?</h2>
          <p>
            Whether you&apos;re planning a new website, brand refresh, video
            campaign, or digital growth strategy, our team is ready to help.
          </p>
          <Link to="/contact" className="btn-cyan-pill">
            <span>Start a Conversation</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </section>

        {relatedPosts.length > 0 && (
          <section className="article-related" aria-label="Related articles">
            <h2>More from Syncra Insights</h2>
            <div className="article-related__grid">
              {relatedPosts.map((related) => (
                <article key={related.id} className="home-insight-card">
                  <Link
                    to={`/insights/${encodeURIComponent(related.slug)}`}
                    className="home-insight-card__media"
                    aria-label={related.title}
                  >
                    {related.cover_image_url ? (
                      <img
                        src={related.cover_image_url}
                        alt={related.title}
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
                      {related.published_at
                        ? new Date(related.published_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Syncra Insights'}
                    </div>
                    <h3>
                      <Link to={`/insights/${encodeURIComponent(related.slug)}`}>
                        {related.title}
                      </Link>
                    </h3>
                    <Link
                      to={`/insights/${encodeURIComponent(related.slug)}`}
                      className="home-insight-card__link"
                    >
                      Read Article <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="blog-post-footer-nav">
          <Link to="/insights" className="btn-ghost-pill">
            ← Back to All Insights
          </Link>
        </div>
      </article>
    </>
  );
}
