import { WHY_WEBSITE_PILLARS } from '../../data/homepageDefaults';
import { ServiceIcon } from '../ServiceIcon';

export default function WhyWebsiteSection() {
  return (
    <section className="home-band home-why" id="why-website">
      <div className="home-container">
        <div className="home-why__shell">
          <div className="home-why__intro reveal-left">
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>WHY YOUR BUSINESS NEEDS A WEBSITE</span>
            </div>

            <h2 className="home-section-title">
              Give your brand a <span>credible home online.</span>
            </h2>

            <p>
              Social media profiles are valuable for reach, but serious clients
              look for a dedicated website before making a decision. A
              thoughtfully built website brings your story, services, and
              contact options into one reliable place that works for your
              business every day.
            </p>

            <div className="home-why__cta-wrap">
              <a href="#contact" className="btn-cyan-pill">
                <span>Discuss Your Website Project</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>

          <div className="home-why__grid">
            {WHY_WEBSITE_PILLARS.map((pillar, index) => (
              <article
                className="home-why-card reveal"
                key={pillar.title}
                style={{ '--reveal-delay': `${(index % 2) * 80}ms` }}
              >
                <div className="home-why-card__icon">
                  <ServiceIcon iconKey={pillar.iconKey} />
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
