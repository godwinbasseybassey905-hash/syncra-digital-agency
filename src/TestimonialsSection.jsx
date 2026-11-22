import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { useScrollReveal } from './hooks/useScrollReveal';

const firstValue = (...values) =>
  values.find(
    (value) => value !== undefined && value !== null && String(value).trim() !== ''
  );

function getSlidesPerView() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 1040) return 2;
  return 3;
}

export default function TestimonialsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perView, setPerView] = useState(getSlidesPerView);
  const [pageIndex, setPageIndex] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadTestimonials() {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .limit(12);

      if (!mounted) return;
      if (error) {
        console.error('Could not load testimonials:', error.message);
        setItems([]);
      } else {
        const visible = (data || []).filter((item) => {
          const flags = [
            'is_active',
            'active',
            'published',
            'is_published',
            'approved',
            'is_approved',
          ];
          const existingFlags = flags.filter((key) => typeof item[key] === 'boolean');
          return (
            existingFlags.length === 0 ||
            existingFlags.every((key) => item[key] === true)
          );
        });
        setItems(visible);
      }
      setLoading(false);
    }
    loadTestimonials();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setPerView(getSlidesPerView());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validItems = items.filter((item) => {
    const quote = firstValue(
      item.quote,
      item.testimonial,
      item.feedback,
      item.message,
      item.content,
      item.review,
      item.comment
    );
    const name = firstValue(
      item.client_name,
      item.name,
      item.full_name,
      item.customer_name,
      item.author
    );
    return Boolean(quote && name);
  });

  const totalPages = Math.max(1, Math.ceil(validItems.length / perView));
  const safePage = pageIndex % totalPages;
  const visibleSlice = validItems.slice(
    safePage * perView,
    safePage * perView + perView
  );

  useScrollReveal(sectionRef, [loading, validItems.length, safePage]);

  return (
    <section
      className="home-band home-testimonials"
      id="testimonials"
      ref={sectionRef}
    >
      <div className="home-container">
        <div className="home-section-header reveal">
          <div>
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>CLIENT FEEDBACK</span>
            </div>
            <h2 className="home-section-title">
              Good work speaks. <span>So do our clients.</span>
            </h2>
          </div>

          <p className="home-section-subtitle">
            Authentic perspectives from businesses and founders who have
            partnered with Syncra Digital Agency.
          </p>
        </div>

        {loading ? (
          <div className="home-state-note" role="status">
            Loading client testimonials...
          </div>
        ) : validItems.length === 0 ? (
          <div className="home-testimonials-empty reveal">
            <div className="home-testimonials-empty__quote" aria-hidden="true">
              “
            </div>
            <h3>Verified client feedback will appear here.</h3>
            <p>
              We only publish genuine testimonials from real clients we have
              worked with. Start your project with Syncra and experience our
              process firsthand.
            </p>
            <a href="#contact" className="btn-ghost-pill">
              <span>Work With Syncra</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        ) : (
          <>
            <div className="home-testimonials__grid">
              {visibleSlice.map((item, index) => {
                const quote = firstValue(
                  item.quote,
                  item.testimonial,
                  item.feedback,
                  item.message,
                  item.content,
                  item.review,
                  item.comment
                );
                const name = firstValue(
                  item.client_name,
                  item.name,
                  item.full_name,
                  item.customer_name,
                  item.author
                );
                const role = firstValue(
                  item.company_name,
                  item.position,
                  item.role,
                  item.job_title,
                  item.client_role,
                  item.company
                );
                const avatar = firstValue(
                  item.avatar_url,
                  item.image_url,
                  item.photo_url,
                  item.profile_image
                );

                return (
                  <article
                    className="home-testimonial-card reveal is-visible"
                    key={item.id || `${name}-${index}`}
                  >
                    <div className="home-testimonial-card__mark" aria-hidden="true">
                      “
                    </div>
                    <p className="home-testimonial-card__quote">{quote}</p>
                    <div className="home-testimonial-card__author">
                      {avatar ? (
                        <img src={avatar} alt={name} loading="lazy" />
                      ) : (
                        <span className="home-testimonial-card__avatar" aria-hidden="true">
                          {String(name).trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <strong>{name}</strong>
                        {role && <small>{role}</small>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="home-testimonials__controls" aria-label="Testimonial slides">
                <button
                  type="button"
                  className="home-carousel-btn"
                  onClick={() =>
                    setPageIndex((prev) => (prev - 1 + totalPages) % totalPages)
                  }
                  aria-label="Previous testimonials"
                >
                  ←
                </button>

                <div className="home-carousel-dots">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={idx === safePage ? 'is-active' : ''}
                      onClick={() => setPageIndex(idx)}
                      aria-label={`Show testimonial page ${idx + 1}`}
                      aria-pressed={idx === safePage}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="home-carousel-btn"
                  onClick={() => setPageIndex((prev) => (prev + 1) % totalPages)}
                  aria-label="Next testimonials"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
