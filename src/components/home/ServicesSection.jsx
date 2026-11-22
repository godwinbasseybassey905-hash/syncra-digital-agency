import { DEFAULT_SERVICES } from '../../data/homepageDefaults';
import { ServiceIcon } from '../ServiceIcon';

export default function ServicesSection({ services, loading }) {
  const hasDbServices = Array.isArray(services) && services.length > 0;
  const displayedServices = hasDbServices ? services : DEFAULT_SERVICES;

  return (
    <section className="home-band home-services" id="services">
      <div className="home-container">
        <div className="home-section-header reveal">
          <div>
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>WHAT WE DO</span>
            </div>
            <h2 className="home-section-title">
              A complete suite of services for <span>modern digital growth.</span>
            </h2>
          </div>

          <p className="home-section-subtitle">
            From high-performing websites and brand identities to video, SEO,
            and AI automation—everything your business needs under one cohesive
            creative partner.
          </p>
        </div>

        {loading ? (
          <div className="home-state-note" role="status">
            Loading Syncra services...
          </div>
        ) : (
          <div className="home-services__grid">
            {displayedServices.map((service, index) => (
              <article
                className="home-service-card reveal"
                key={service.id || `${service.title}-${index}`}
                style={{ '--reveal-delay': `${(index % 3) * 70}ms` }}
              >
                <div className="home-service-card__top">
                  <div className="home-service-card__icon">
                    <ServiceIcon service={service} />
                  </div>
                  <span className="home-service-card__num">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <a href="#contact" className="home-service-card__link">
                  Enquire about this service <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        )}

        <div className="home-inline-cta reveal">
          <div>
            <span className="home-inline-cta__eyebrow">TAILORED DIGITAL SOLUTIONS</span>
            <p>Not sure which combination of services fits your goals right now?</p>
          </div>
          <a href="#contact" className="btn-cyan-pill">
            <span>Let&apos;s figure it out together</span>
            <span className="btn-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
