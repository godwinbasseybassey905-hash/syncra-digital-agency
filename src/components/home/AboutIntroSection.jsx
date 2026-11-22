import { Link } from 'react-router-dom';

const DEFAULT_VALUES = {
  eyebrow: 'OUR VALUES',
  heading: 'Where Creativity Meets Digital Strategy.',
  intro:
    'Every website, campaign, and visual asset we deliver is grounded in clarity, thoughtful design, and practical execution.',
  vision:
    'To empower businesses with thoughtful digital experiences that make them more visible, memorable, and ready for sustainable growth.',
  mission:
    'To combine creativity, technology, and strategic thinking to deliver practical digital solutions that help our clients communicate clearly, connect with their audiences, and grow with confidence.',
  stats: [
    { value: '0', label: 'Completed Projects' },
    { value: '0', label: 'Happy Clients' },
    { value: '—', label: 'Client Ratings' },
    { value: '—', label: 'Years of Experience' },
  ],
};

export default function AboutIntroSection({ aboutContent, valuesContent }) {
  const founderName = aboutContent?.founderName?.trim() || 'Godwin Bassey Bassey';
  const founderRole = aboutContent?.founderRole?.trim() || 'Founder & CEO';
  const eyebrow = aboutContent?.aboutEyebrow?.trim() || 'ABOUT SYNCRA DIGITAL AGENCY';
  const headline =
    aboutContent?.aboutHeadline?.trim() ||
    'Creativity and technology working together for your business.';
  const biography =
    aboutContent?.aboutBiography?.trim() ||
    'Syncra Digital Agency is a Lagos-based digital partner dedicated to helping businesses, founders, and growing brands build a strong, credible presence online. By bringing web development, design, video, content, and modern technology under one roof, we turn complex digital needs into clear, cohesive experiences built to support long-term growth.';
  const buttonText = aboutContent?.aboutButtonText?.trim() || 'Let’s Work Together';

  const values = {
    eyebrow: valuesContent?.eyebrow?.trim() || DEFAULT_VALUES.eyebrow,
    heading: valuesContent?.heading?.trim() || DEFAULT_VALUES.heading,
    intro: valuesContent?.intro?.trim() || DEFAULT_VALUES.intro,
    vision: valuesContent?.vision?.trim() || DEFAULT_VALUES.vision,
    mission: valuesContent?.mission?.trim() || DEFAULT_VALUES.mission,
    stats:
      Array.isArray(valuesContent?.stats) && valuesContent.stats.length > 0
        ? valuesContent.stats
        : DEFAULT_VALUES.stats,
  };

  return (
    <section className="home-band home-about" id="about">
      <div className="home-container">
        <div className="home-about__grid">
          <div className="home-about__copy reveal-left">
            <div className="pill-eyebrow">
              <span className="pill-eyebrow__dot" aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>

            <h2 className="home-section-title">{headline}</h2>

            <p className="home-about__lead">
              We partner with ambitious startups, service providers, and
              established businesses ready to present their brand with clarity
              and confidence across every digital touchpoint.
            </p>

            <p className="home-about__bio">{biography}</p>

            <div className="home-about__pillars">
              <div>
                <strong>Who We Help</strong>
                <span>Growing brands, entrepreneurs, and organizations seeking a unified digital presence.</span>
              </div>
              <div>
                <strong>How We Work</strong>
                <span>Blending creative storytelling, responsive engineering, and practical business strategy.</span>
              </div>
            </div>

            <div className="home-about__founder-meta">
              <div>
                <strong>{founderName}</strong>
                <span>{founderRole}, Syncra Digital Agency</span>
              </div>
            </div>

            <div className="home-about__actions">
              <a href="#contact" className="btn-cyan-pill">
                <span>{buttonText}</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <Link to="/about" className="btn-text-link">
                More about Syncra <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className="home-about__visual reveal-right">
            <div className="home-about__portrait-frame">
              {aboutContent?.founderPhotoUrl ? (
                <img
                  src={aboutContent.founderPhotoUrl}
                  alt={
                    aboutContent.founderPhotoAlt ||
                    `${founderName}, ${founderRole} of Syncra Digital Agency`
                  }
                  loading="lazy"
                />
              ) : (
                <div className="about-photo-placeholder">
                  <span>S.</span>
                  <small>FOUNDER PORTRAIT</small>
                </div>
              )}
              <div className="home-about__portrait-caption">
                <span>FOUNDER &amp; LEADERSHIP</span>
                <strong>{founderName}</strong>
                <small>{founderRole} · Lagos State, Nigeria</small>
              </div>
            </div>
          </div>
        </div>

        <div className="home-values-block reveal" id="values">
          <div className="home-values-block__header">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>{values.eyebrow}</span>
              </div>
              <h3>{values.heading}</h3>
            </div>
            <p>{values.intro}</p>
          </div>

          <div className="home-values-block__cards">
            <article className="home-value-card">
              <span className="home-value-card__tag">01 / VISION</span>
              <h4>Vision Statement</h4>
              <p>{values.vision}</p>
            </article>

            <article className="home-value-card home-value-card--mission">
              <span className="home-value-card__tag">02 / MISSION</span>
              <h4>Mission Statement</h4>
              <p>{values.mission}</p>
            </article>
          </div>

          <div className="home-stats-strip" aria-label="Agency figures">
            {values.stats.map((stat, index) => (
              <div className="home-stats-strip__item" key={`${stat.label}-${index}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
