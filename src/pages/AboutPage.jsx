import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PHILOSOPHY_PILLARS = [
  {
    number: '01',
    title: 'Creativity',
    description:
      'Distinctive visual craft across websites, graphics, video, and brand identity so your business looks intentional and memorable.',
  },
  {
    number: '02',
    title: 'Technology',
    description:
      'Responsive modern web engineering, clean structure, and practical AI automation built to perform reliably across devices.',
  },
  {
    number: '03',
    title: 'Strategy',
    description:
      'Every layout, message, and campaign starts with clear positioning—aligning design choices with how real customers make decisions.',
  },
  {
    number: '04',
    title: 'Growth',
    description:
      'Building durable digital foundations—web, SEO, content, and social presence—that scale smoothly as your business expands.',
  },
];

const PROBLEM_SOLVING_APPROACH = [
  {
    title: 'Listening Before Designing',
    description:
      'We begin by clarifying your actual business challenges, target audience, and priorities rather than rushing into visuals without direction.',
  },
  {
    title: 'Unifying Fragmented Touchpoints',
    description:
      'Instead of disconnected websites, graphics, and social content, we bring your digital presence under one cohesive creative system.',
  },
  {
    title: 'Prioritizing Clarity Over Clutter',
    description:
      'Every headline, page layout, and call to action is structured to help prospective clients understand what you offer and take the next step.',
  },
  {
    title: 'Building for Long-Term Ownership',
    description:
      'We focus on maintainable digital foundations and clear communication so your brand can continue evolving confidently after launch.',
  },
];

const DEFAULT_VALUES = {
  eyebrow: 'OUR VALUES',
  heading: 'Where Creativity Meets Digital Strategy.',
  intro:
    'Our work is guided by clarity, honest communication, and thoughtful execution tailored to each client’s business goals.',
  vision:
    'To empower businesses with thoughtful digital experiences that make them more visible, memorable, and ready for sustainable growth.',
  mission:
    'To combine creativity, technology, and strategic thinking to deliver practical digital solutions that help our clients communicate clearly, connect with their audiences, and grow with confidence.',
};

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState(null);
  const [valuesContent, setValuesContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select('id, content')
        .in('id', ['about', 'values']);

      if (!mounted) return;
      if (!error && Array.isArray(data)) {
        const map = {};
        data.forEach((row) => {
          map[row.id] = row.content || null;
        });
        setAboutContent(map.about || null);
        setValuesContent(map.values || null);
      }
      setLoading(false);
    }

    loadContent();
    return () => {
      mounted = false;
    };
  }, []);

  useScrollReveal(pageRef, [loading]);

  const founderName = aboutContent?.founderName?.trim() || 'Godwin Bassey Bassey';
  const founderRole = aboutContent?.founderRole?.trim() || 'Founder & CEO';
  const heroHeadline =
    aboutContent?.aboutHeadline?.trim() ||
    'Transforming businesses in the digital age.';
  const biography =
    aboutContent?.aboutBiography?.trim() ||
    'I’m Godwin Bassey Bassey, CEO and Founder of Syncra Digital Agency. I lead a creative team focused on helping businesses build a stronger digital presence through thoughtful design, technology and strategy. At Syncra, we bring ideas to life with digital solutions designed around each client’s goals.';

  const values = {
    eyebrow: valuesContent?.eyebrow?.trim() || DEFAULT_VALUES.eyebrow,
    heading: valuesContent?.heading?.trim() || DEFAULT_VALUES.heading,
    intro: valuesContent?.intro?.trim() || DEFAULT_VALUES.intro,
    vision: valuesContent?.vision?.trim() || DEFAULT_VALUES.vision,
    mission: valuesContent?.mission?.trim() || DEFAULT_VALUES.mission,
    stats: Array.isArray(valuesContent?.stats) ? valuesContent.stats : null,
  };

  return (
    <div className="subpage-shell" ref={pageRef}>
      <section className="subpage-hero">
        <div className="subpage-container">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About</span>
          </nav>

          <div className="subpage-hero__grid">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>{aboutContent?.aboutEyebrow?.trim() || 'ABOUT SYNCRA'}</span>
              </div>

              <h1>{heroHeadline}</h1>

              <p className="subpage-hero__lead">
                Syncra Digital Agency is a Lagos-based creative and technology
                partner helping businesses build a clear, compelling presence
                across web, branding, visuals, video, content, and digital
                marketing.
              </p>

              <div className="subpage-hero__actions">
                <Link to="/contact" className="btn-cyan-pill">
                  <span>{aboutContent?.aboutButtonText?.trim() || 'Work With Syncra'}</span>
                  <span className="btn-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link to="/portfolio" className="btn-ghost-pill">
                  Explore Portfolio
                </Link>
              </div>
            </div>

            <div className="subpage-hero__aside">
              <div className="subpage-meta-card">
                <span>HEADQUARTERS</span>
                <strong>Lagos State, Nigeria</strong>
                <p>
                  Collaborating with businesses locally and remotely through
                  clear digital workflows and direct communication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="about-story-grid">
            <div className="about-story-copy reveal-left">
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>WHO WE ARE</span>
              </div>
              <h2>A one-stop digital partner built around clarity and craft.</h2>
              <p>
                Many growing businesses struggle with disconnected digital
                efforts—a website that does not match their social presence,
                visuals that lack consistency, or content that fails to explain
                their real value.
              </p>
              <p>
                Syncra Digital Agency brings website design and development,
                branding, graphic design, video editing, copywriting, SEO,
                social media, digital marketing, and AI automation into one
                focused studio—so every piece of your brand works together.
              </p>
            </div>

            <div className="about-audience-cards reveal-right">
              <article className="about-audience-card">
                <span>01 / WHO WE HELP</span>
                <h3>Founders &amp; Emerging Brands</h3>
                <p>
                  Entrepreneurs and new ventures launching with a strong brand
                  foundation, credible website, and clear messaging from day one.
                </p>
              </article>

              <article className="about-audience-card">
                <span>02 / WHO WE HELP</span>
                <h3>Established Service &amp; Growing Businesses</h3>
                <p>
                  Businesses modernizing their online home, refining visual
                  identity, and creating consistent content that supports
                  meaningful enquiries.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="about-founder-panel reveal">
            <div className="about-founder-portrait">
              {aboutContent?.founderPhotoUrl ? (
                <img
                  src={aboutContent.founderPhotoUrl}
                  alt={
                    aboutContent.founderPhotoAlt ||
                    `${founderName}, ${founderRole} of Syncra Digital Agency`
                  }
                />
              ) : (
                <div className="about-photo-placeholder">
                  <span>S.</span>
                  <small>FOUNDER PORTRAIT</small>
                </div>
              )}
              <div className="about-founder-portrait__caption">
                <strong>{founderName}</strong>
                <span>{founderRole} · Syncra Digital Agency</span>
              </div>
            </div>

            <div className="about-founder-copy">
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>LEADERSHIP</span>
              </div>
              <h2>{founderName}</h2>
              <p>{biography}</p>
              <Link to="/contact" className="btn-cyan-pill">
                <span>Start a Conversation</span>
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="home-section-header reveal">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>OUR PHILOSOPHY</span>
              </div>
              <h2 className="home-section-title">
                Creativity, Technology, Strategy <span>&amp; Growth.</span>
              </h2>
            </div>
            <p className="home-section-subtitle">
              Four interconnected pillars guide every decision we make—from
              initial discovery to final delivery.
            </p>
          </div>

          <div className="about-philosophy-grid">
            {PHILOSOPHY_PILLARS.map((pillar, index) => (
              <article
                className="about-philosophy-card reveal"
                key={pillar.title}
                style={{ '--reveal-delay': `${index * 70}ms` }}
              >
                <span className="about-philosophy-card__num">{pillar.number}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="home-values-block reveal">
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

            {values.stats && values.stats.length > 0 && (
              <div className="home-stats-strip" aria-label="Agency figures">
                {values.stats.map((stat, index) => (
                  <div className="home-stats-strip__item" key={`${stat.label}-${index}`}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="subpage-band">
        <div className="subpage-container">
          <div className="home-section-header reveal">
            <div>
              <div className="pill-eyebrow">
                <span className="pill-eyebrow__dot" aria-hidden="true" />
                <span>HOW WE SOLVE PROBLEMS</span>
              </div>
              <h2 className="home-section-title">
                Practical execution centered on <span>your business goals.</span>
              </h2>
            </div>
            <p className="home-section-subtitle">
              We focus on solving real communication and brand challenges with
              disciplined craft rather than unnecessary complexity.
            </p>
          </div>

          <div className="about-principles-grid">
            {PROBLEM_SOLVING_APPROACH.map((item, index) => (
              <article
                className="about-principle-item reveal"
                key={item.title}
                style={{ '--reveal-delay': `${(index % 2) * 80}ms` }}
              >
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="home-inline-cta reveal">
            <div>
              <span className="home-inline-cta__eyebrow">READY TO COLLABORATE?</span>
              <p>
                Tell us about your website, brand identity, or digital goals and
                let&apos;s explore the right next step together.
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
