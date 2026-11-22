import { useEffect, useState } from 'react';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_HOMEPAGE_CONTENT,
} from '../../data/homepageDefaults';

export default function HeroSection({ homepageContent, publishedProjectCount = 0 }) {
  const slides =
    Array.isArray(homepageContent?.slides) && homepageContent.slides.length > 0
      ? homepageContent.slides
      : DEFAULT_HERO_SLIDES;

  const [activeSlide, setActiveSlide] = useState(0);
  const [failedSlides, setFailedSlides] = useState({});

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const safeIndex = activeSlide % slides.length;
  const currentSlide = slides[safeIndex] || DEFAULT_HERO_SLIDES[0];
  const slideNumber = String(safeIndex + 1).padStart(2, '0');
  const slideTotal = String(slides.length).padStart(2, '0');

  const eyebrow =
    homepageContent?.eyebrow?.trim() || DEFAULT_HOMEPAGE_CONTENT.eyebrow;
  const headline =
    homepageContent?.headline?.trim() || DEFAULT_HOMEPAGE_CONTENT.headline;
  const description =
    homepageContent?.description?.trim() || DEFAULT_HOMEPAGE_CONTENT.description;
  const primaryButton =
    homepageContent?.primaryButton?.trim() || DEFAULT_HOMEPAGE_CONTENT.primaryButton;
  const secondaryButton =
    homepageContent?.secondaryButton?.trim() || DEFAULT_HOMEPAGE_CONTENT.secondaryButton;

  const savedHighlightNum = homepageContent?.highlightNumber?.trim();
  const highlightNumber =
    savedHighlightNum && savedHighlightNum !== '0'
      ? savedHighlightNum
      : String(publishedProjectCount);
  const highlightLabel =
    homepageContent?.highlightLabel?.trim() || DEFAULT_HOMEPAGE_CONTENT.highlightLabel;

  return (
    <section className="home-hero" id="home" aria-label="Syncra Digital Agency introduction">
      <div className="home-hero__media" aria-hidden="true">
        {slides.map((slide, index) => {
          const slideKey = `${slide.image || 'slide'}-${index}`;
          const hasImage = Boolean(slide.image) && !failedSlides[slideKey];

          return (
            <div
              key={slideKey}
              className={`home-hero__slide ${index === safeIndex ? 'is-active' : ''} ${
                !hasImage ? 'hero-slide-fallback' : ''
              }`}
            >
              {hasImage && (
                <img
                  src={slide.image}
                  alt={index === safeIndex ? slide.label || 'Syncra Digital Agency' : ''}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onError={() =>
                    setFailedSlides((prev) =>
                      prev[slideKey] ? prev : { ...prev, [slideKey]: true }
                    )
                  }
                />
              )}
            </div>
          );
        })}
        <div className="home-hero__scrim" />
        <div className="home-hero__grid-overlay" />
      </div>

      <div className="home-hero__inner">
        <div className="home-hero__main">
          <div className="pill-eyebrow">
            <span className="pill-eyebrow__dot" aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>

          <h1 className="home-hero__title">{headline}</h1>

          <p className="home-hero__desc">{description}</p>

          <div className="home-hero__actions">
            <a href="#contact" className="btn-cyan-pill">
              <span>{primaryButton}</span>
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </a>

            <a href="#projects" className="btn-ghost-pill">
              <span>{secondaryButton}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <p className="home-hero__tagline">
            CREATIVE THINKING · STRATEGIC EXECUTION · MEASURABLE CLARITY
          </p>
        </div>

        <aside className="home-hero__aside" aria-label="Agency project highlight">
          <div className="hero-stat-card">
            <div className="hero-stat-card__top">
              <span className="hero-stat-card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-10Z" />
                  <path d="M8 5V3.5h8V5M8 12h8M8 15.5h5" />
                </svg>
              </span>
              <span className="hero-stat-card__badge">SYNCRA STUDIO</span>
            </div>

            <div className="hero-stat-card__metric">
              <strong>{highlightNumber}</strong>
              <span>{highlightLabel}</span>
            </div>

            <p className="hero-stat-card__note">
              Websites, branding, graphics, video, and digital strategy crafted
              around your business goals.
            </p>

            <a href="#contact" className="hero-stat-card__cta">
              <span>Start Your Project</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>
      </div>

      <div className="home-hero__bar">
        <div className="home-hero__caption">
          <span className="home-hero__slide-tag">
            {slideNumber} / {slideTotal} · {currentSlide.label}
          </span>
          <p>{currentSlide.caption}</p>
        </div>

        <div className="home-hero__dots" role="group" aria-label="Hero slide selector">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={`${slide.image || 'dot'}-${index}`}
              className={index === safeIndex ? 'is-active' : ''}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show slide ${index + 1} of ${slides.length}`}
              aria-pressed={index === safeIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
